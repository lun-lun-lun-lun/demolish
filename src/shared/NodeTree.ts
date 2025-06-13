//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { AutoCache } from 'shared/AutoCache';

import { sphereInSphere } from 'shared/CollisionCheck';

//shortened func defs
const newVector = vector.create; //creates a new vector
const dotProduct = vector.dot; //calculates dot product of two vectors

//vars
const BOX_SPHERE_CONSTANT = math.sqrt(3); //used to convert box size to sphere radius
const O = -1; //only using this so its easier to see the comparison to binary
const octreePositions = table.freeze([
  //Really cool way to do this (and its faster when I combine it with the suffix logic from BinaryOctree)
  newVector(O, O, O), // 0000 = 0
  newVector(O, O, 1), // 0001 = 1
  newVector(O, 1, O), // 0010 = 2
  newVector(O, 1, 1), // 0011 = 3
  newVector(1, O, O), // 0100 = 4
  newVector(1, O, 1), // 0101 = 5
  newVector(1, 1, O), // 0110 = 6
  newVector(1, 1, 1) //  0111 = 7
]); //positions for octree child nodes
const quadtreePositions = table.freeze([
  //Z is the ignored axis. substitute X with Z if needed.
  newVector(O, O, O), // 0000 = 0
  newVector(O, 1, O), // 0001 = 1
  newVector(1, O, O), // 0010 = 2
  newVector(1, 1, O) //  0011 = 3
]); //positions for quadtree child nodes
const dualtreePositions = table.freeze([
  //Y and Z are the ignored axes.
  newVector(O, O, O), // 0000 = 0
  newVector(1, O, O) //  0001 = 1
]); //positions for dualtree child nodes

const EMPTY_VECTOR = vector.zero;
const EMPTY_CFRAME = new CFrame(0, 0, 0);
const templatePart = new Instance('Part'); //template part for visualization
{
  templatePart.Parent = Workspace;
  templatePart.Anchored = true; //anchored so it does not move
  templatePart.CanCollide = false;
  templatePart.Transparency = 0;
  templatePart.CastShadow = false;
  templatePart.Shape = Enum.PartType.Block;
}

export const partCache = new AutoCache(templatePart, 1000, undefined);

//functions
function squareMagnitude(position: vector): number {
  return position.x * position.x + position.y * position.y + position.z * position.z;
}

//return the bounding sphere of a model or basepart
function getBoundingSphere(item: BasePart | Model) {
  let radius;
  if (item.IsA('BasePart')) {
    radius = item.Size.Magnitude / 2;
  } else {
    //const model = item as Model;
    radius = item.GetExtentsSize().Magnitude / 2;
  }
  return radius;
}

type item = Part | Model;

//NodeTree is more bare bones and used purely for the destruction aspect
export class NodeTree {
  public itemCache = partCache;
  public cFrame: CFrame = EMPTY_CFRAME; //a cframe is position and rotation
  public size: vector = EMPTY_VECTOR;
  public children: item[][] = [[]] as unknown as item[][]; //array of arrays for child items
  //public childNodes: [[NodeTree]] = [[]] as unknown as [[NodeTree]];
  //public depth: number = 0;
  constructor(cFrame: CFrame, size: vector, children?: [[item]]) {
    this.cFrame = cFrame; //need cframes so I can use ToWorldSpace and position stuff easily regardless of size and rotation
    this.size = size;
    if (children !== undefined) {
      this.children = children;
    }
  }
  _getNodeOffsetAndSize(node: number) {
    const position = this.cFrame.Position as unknown as vector; //get position from cframe
    //the length of the binary sequence for our node number
    //we subtract one because the for loop will run at least once
    //additionally, NumberLength should always be a multiple of 3, because its only possible for us to get certain nodes like: 1 U [8,15] U [64,71] etc
    const binaryLength = math.max(32 - bit32.countlz(node), 0) - 1; //get binary sequence (010100010111) length of node index
    let [stepX, stepY, stepZ] = [this.size.x / 4, this.size.y / 4, this.size.z / 4]; //initial step size
    let newPosition = [0, 0, 0]; //start at origin
    //traverse through the multiple of 3 by 3s

    for (let i = 1; i <= binaryLength; i += 3) {
      //from right to left, extract 3 bits from the binary sequence and convert it to an actual number
      const octreePositionIndex = bit32.extract(node, binaryLength - i - 2, 3) + 1; //get child index
      const octreePosition = octreePositions[octreePositionIndex - 1]; //get child position
      const stepAxes = [
        stepX * octreePosition.x,
        stepY * octreePosition.y,
        stepZ * octreePosition.z
      ]; //calculate step for each axis
      //we only need to make a vector of this at the end. for now, we use an array, since theyre faster
      //update position. we treat 0 as x, 1 as y, and 2 as z
      newPosition = [
        newPosition[0] + stepAxes[0],
        newPosition[1] + stepAxes[1],
        newPosition[2] + stepAxes[2]
      ];
      //i += 3;
      [stepX, stepY, stepZ] = [stepX / 2, stepY / 2, stepZ / 2]; //halve step size for next level
    }
    return [
      newVector(
        newPosition[0], // + position.x
        newPosition[1], // + position.y
        newPosition[2] //  + position.z
      ),
      newVector(stepX * 4, stepY * 4, stepZ * 4)
    ]; //return offset and size as vector3s
  }
  display(shape: Enum.PartType, color: Color3, node?: number, time?: number) {
    const children = this.children;
    let displayParts: Part[] = [];
    let startingNode = 1; //start at root node
    if (node !== undefined) startingNode = node;
    //if the node has children...
    if (children[startingNode * 8] !== undefined) {
      for (let i = 0; i <= 7; i++) {
        displayParts = [
          ...displayParts,
          ...this.display(Enum.PartType.Block, color, startingNode * 8 + i)
        ]; //recursively display child nodes
      }
    } else {
      //display the part
      const nodePart = partCache.get() as Part;
      nodePart.Color = color;
      const [offset, size] = this._getNodeOffsetAndSize(startingNode);
      nodePart.Size = size as unknown as Vector3;
      nodePart.Shape = shape; //set shape
      nodePart.Parent = Workspace; //parent to workspace
      nodePart.CFrame = this.cFrame.ToWorldSpace(
        //move nodePart to this new pos and rot rbased on my cframe (pos and rotation)
        new CFrame(offset as unknown as Vector3)
      );
      if (time !== undefined) {
        task.spawn(function () {
          task.wait(time);
          partCache.return(nodePart);
        }); //return part to cache after time
      }
      displayParts.push(nodePart); //add part to array
    }
    return displayParts; //return array of displayed parts
  }

  //divide into 8 equally distanced, equally sized parts
  divide8(node: number, timesToDivide: number, divisions?: number) {
    if (divisions === undefined) divisions = 0; //set default division count
    const children = this.children; //get children array
    const shiftedNode = node * 8; //children are at
    let newNodes: number[] = [] as unknown as number[]; //array for new nodes

    if (divisions >= timesToDivide) return newNodes; //stop if reached max divisions
    for (let i = 0; i <= 7; i++) {
      children[shiftedNode + i - 1] = [] as unknown as [item]; //create new child node
      const additions: number[] = this.divide8(
        shiftedNode + i,
        timesToDivide,
        divisions + 1
      ); //recursively divide child
      newNodes.push(shiftedNode + i); //add new node
      newNodes = [...newNodes, ...additions]; //appedn newly created nodes
    }
    return newNodes; //return array of new nodes
  }
}

export class SphereTree extends NodeTree {
  public position: vector = EMPTY_VECTOR; //center position of sphere tree
  public radius: number = 5; //radius of sphere tree
  public maxDepth: number = 4; //maximum depth of tree
  public maxItems: number = 5; //maximum items per node
  constructor(
    position: vector,
    radius: number,
    children?: [[item]],
    maxDepth?: number,
    maxItems?: number
  ) {
    super(
      //maybe i should just create a new class so I can avoid doing this silly stuff
      undefined as unknown as CFrame,
      undefined as unknown as vector
    ); //call parent constructor with dummy values
    this.position = position;
    this.radius = radius;
    if (children !== undefined) this.children = children;
    if (maxDepth !== undefined) this.maxDepth = maxDepth;
    if (maxItems !== undefined) this.maxItems = maxItems;
  }
  _display(color: Color3, node?: number, time?: number) {
    const children = this.children;
    let displayParts: Part[] = [];
    let startingNode = 1; //start at root node
    if (node !== undefined) startingNode = node;
    //if the node has children...
    if (children[startingNode * 8] !== undefined) {
      for (let i = 0; i <= 7; i++) {
        displayParts = [...displayParts, ...this._display(color, startingNode * 8 + i)];
      } //recursively display child nodes
    } else {
      //display the part
      const nodePart = partCache.get() as Part;
      nodePart.Color = color;
      const [offset, radius] = this._getNodeOffsetAndRadius(startingNode);

      nodePart.Size = newVector(radius, radius, radius) as unknown as Vector3;
      nodePart.Shape = Enum.PartType.Ball;
      nodePart.Parent = Workspace;
      nodePart.Locked = true;
      nodePart.Transparency = 0.9;
      nodePart.Position = newVector(
        this.position.x + offset.x,
        this.position.y + offset.y,
        this.position.z + offset.z
      ) as unknown as Vector3; //set position
      if (time !== undefined) {
        task.spawn(function () {
          task.wait(time);
          partCache.return(nodePart);
        }); //return part to cache after time
      }
      displayParts.push(nodePart); //add part to array
    }
    return displayParts; //return array of displayed parts
  }

  _reassignItems(node: number, nodePosition: [number, number, number]) {
    //
    const children = this.children; //get children array
    this.divide8(node, 1); //divide node into 8 children

    const nodeArray = children[node - 1]; //get array of items in node
    const nodeChildrenIndex = node * 8; //get index for child nodes

    for (let i = 0; i < nodeArray.size(); i++) {
      const item = nodeArray[i];
      const itemPosition = item.GetPivot().Position;
      let nodePositionIndex = 0;
      if (itemPosition.X > nodePosition[0]) {
        nodePositionIndex += 4;
      }
      if (itemPosition.Y > nodePosition[1]) {
        nodePositionIndex += 2;
      }
      if (itemPosition.Z > nodePosition[2]) {
        nodePositionIndex += 1;
      }
      //assign item to correct child node
      children[nodeChildrenIndex + nodePositionIndex - 1].push(item);
    }
    table.clear(nodeArray); //empty items from parent node
  }

  insertPart(part: Part) {
    let depth = 0; //current depth
    let step = this.radius / 4;
    let chosenNode = 1; //start at root node

    const children = this.children;
    const maxDepth = this.maxDepth;
    const maxItems = this.maxItems;
    const partPosition = part.Position; //get part position
    const [partPositionX, partPositionY, partPositionZ] = [
      partPosition.X,
      partPosition.Y,
      partPosition.Z
    ]; //decompose position
    const position = this.position; //get tree position
    let nodePosition: [number, number, number] = [position.x, position.y, position.z]; //current node position
    const [nodePositionX, nodePositionY, nodePositionZ] = [
      nodePosition[0],
      nodePosition[1],
      nodePosition[2]
    ]; //decompose node position
    while (part) {
      //where the binary stuff in the octreePositions table comes in
      //can figure out where to put the part much faster by doing this
      //choose (local) node index based on position, made easy by the binary sequeunce ordering
      let nodePositionIndex = 0;
      //x00
      if (partPositionX > nodePositionX) {
        nodePositionIndex += 4;
      }
      //0x0
      if (partPositionY > nodePositionY) {
        nodePositionIndex += 2;
      }
      //00x
      if (partPositionZ > nodePositionZ) {
        nodePositionIndex += 1;
      }
      const nextNode = chosenNode * 8 + nodePositionIndex;

      //Found a suitable leaf (empty) node?
      if (children[nextNode] === undefined) {
        //put our part in the parent of that leaf node

        const chosenNodeArray = children[chosenNode - 1];
        chosenNodeArray.push(part);

        //divide that node if there are too many things in it
        if (chosenNodeArray.size() > maxItems && depth < maxDepth) {
          this._reassignItems(chosenNode, nodePosition);
        }
        break;
      }

      nodePosition = [
        nodePosition[0] + step * octreePositions[nodePositionIndex].x,
        nodePosition[1] + step * octreePositions[nodePositionIndex].y,
        nodePosition[2] + step * octreePositions[nodePositionIndex].z
      ]; //update node position
      step /= 2; //halve step size
      chosenNode = nextNode; //move to next node
      depth++; //increase depth
    }
  }

  removePart(part: Part) {
    let step = this.radius / 4;
    let chosenNode = 1; //start at root node

    const children = this.children;
    const maxDepth = this.maxDepth;
    const maxItems = this.maxItems;
    const partPosition = part.Position;
    const [partPositionX, partPositionY, partPositionZ] = [
      partPosition.X,
      partPosition.Y,
      partPosition.Z
    ];
    const position = this.position;
    let nodePosition: [number, number, number] = [position.x, position.y, position.z]; //current node position
    const [nodePositionX, nodePositionY, nodePositionZ] = [
      nodePosition[0],
      nodePosition[1],
      nodePosition[2]
    ];
    while (part) {
      let nodePositionIndex = 0;
      if (partPositionX > nodePositionX) {
        nodePositionIndex += 4;
      }
      if (partPositionY > nodePositionY) {
        nodePositionIndex += 2;
      }
      if (partPositionZ > nodePositionZ) {
        nodePositionIndex += 1;
      }
      const nextNode = chosenNode * 8 + nodePositionIndex;

      //Found a suitable leaf (empty) node?
      if (children[nextNode] === undefined) {
        //put our part in the parent of that leaf node
        const leafNode = children[chosenNode - 1];
        const index = leafNode.indexOf(part);
        if (index !== -1) {
          leafNode.remove(index); //Remove 1 element at that index
        }
        break;
      }

      nodePosition = [
        nodePosition[0] + step * octreePositions[nodePositionIndex].x,
        nodePosition[1] + step * octreePositions[nodePositionIndex].y,
        nodePosition[2] + step * octreePositions[nodePositionIndex].z
      ]; //update current node position
      step /= 2;
      chosenNode = nextNode; //move to next node
    }
  }

  _getNodeOffsetAndRadius(node: number): [vector, number] {
    const position = this.position as unknown as vector; //get center position
    //the length of the binary sequence for our node number
    //we subtract one because the for loop will run at least once
    //additionally, NumberLength should always be a multiple of 3, because its only possible for us to get certain nodes, ie those in: 1 U [8,15] U [64,71] etc
    const binaryLength = math.max(32 - bit32.countlz(node), 0) - 1; //get binary length of node index
    let step = this.radius / 4; //initial step size
    let newPosition = [0, 0, 0]; //start at origin
    //traverse through the multiple of 3 by 3s

    for (let i = 1; i <= binaryLength; i += 3) {
      //from right to left, extract 3 bits from the binary sequence and convert it to an actual number
      const octreePositionIndex = bit32.extract(node, binaryLength - i - 2, 3) + 1; //get child index
      const octreePosition = octreePositions[octreePositionIndex - 1]; //get child position
      const stepAxes = [
        step * octreePosition.x,
        step * octreePosition.y,
        step * octreePosition.z
      ];
      //we only need to make a vector of this at the end. for now, we use an array, since theyre slightly faster
      newPosition = [
        newPosition[0] + stepAxes[0],
        newPosition[1] + stepAxes[1],
        newPosition[2] + stepAxes[2]
      ];
      //i += 3;
      step /= 2; //halve step size for next level
    }
    return [
      newVector(
        newPosition[0], // + position.x
        newPosition[1], // + position.y
        newPosition[2] //  + position.z
      ),
      step * 4 * BOX_SPHERE_CONSTANT
    ]; //return offset and radius
  }

  query(queryPosition: vector, queryRadius: number) {
    // queryRadius *= queryRadius;
    const children = this.children;
    const position = this.position;
    const [positionX, positionY, positionZ] = [position.x, position.y, position.z];
    const chosenNodes = [1]; //stack for nodes to check
    const detectedItems = []; //array for detected items

    while (chosenNodes.size() > 0) {
      const node = chosenNodes.pop() as number; //get node index
      const nodeItems = children[node - 1]; //get items in node
      const [nodeOffset, nodeRadius] = this._getNodeOffsetAndRadius(node); //get offset and radius
      const nodePosition = newVector(
        positionX + nodeOffset.x,
        positionY + nodeOffset.y,
        positionZ + nodeOffset.z
      );
      //if approximated spheres not touching, continue
      if (!sphereInSphere(nodePosition, nodeRadius, queryPosition, queryRadius)) continue; //skip if not colliding
      const childPosition = node * 8; //get starting index pos for child nodes
      //justr imagine its 'octreepositionindex' instead of posIndex here. Way too long and im not writing allat
      for (let posIndex = 0; posIndex <= 7; posIndex++) {
        const nextNode = childPosition + posIndex;
        if (children[nextNode - 1] === undefined) {
          if (nodeItems.size() > 0) {
            for (const item of nodeItems) {
              const collided = sphereInSphere(
                item.GetPivot().Position as unknown as vector,
                getBoundingSphere(item),
                queryPosition,
                queryRadius
              ); //check collision with item
              if (collided === true) {
                detectedItems.push(item); //add item if colliding
              }
            }
          }
          break;
        }
        chosenNodes.push(nextNode); //add child node to stack
      }
    }
    return detectedItems;
  }
}
