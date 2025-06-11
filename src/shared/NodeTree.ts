//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { AutoCache } from 'shared/AutoCache';
import { pointInBox } from './CollisionCheck';
import { boxInSphere } from './CollisionCheck';
import { sphereInSphere } from './CollisionCheck';
import { boxInBox } from './CollisionCheck';

//shortened func defs
const newVector = vector.create;
const dotProduct = vector.dot;

//vars
const BOX_SPHERE_CONSTANT = math.sqrt(3);
const O = -1; //only using this so its easier to see the comparison to binary
const octreePositions = table.freeze([
  //Really cool way to do this (and its faster when I combine it with the suffix logic from BinaryOctree)
  newVector(O, O, O), //  0000 = 0
  newVector(O, O, 1), //  0001 = 1
  newVector(O, 1, O), //  0010 = 2
  newVector(O, 1, 1), //  0011 = 3
  newVector(1, O, O), //  0100 = 4
  newVector(1, O, 1), //  0101 = 5
  newVector(1, 1, O), //  0110 = 6
  newVector(1, 1, 1) //   0111 = 7
]);
const quadtreePositions = table.freeze([
  //Z is the ignored axis. substitute X with Z if needed.
  newVector(O, O, O), //  0000 = 0
  newVector(O, 1, O), //  0001 = 1
  newVector(1, O, O), //  0010 = 2
  newVector(1, 1, O) //   0011 = 3
]);
const dualtreePositions = table.freeze([
  //Y and Z are the ignored axes.
  newVector(O, O, O), //  0000 = 0
  newVector(1, O, O) //   0001 = 1
]);

const EMPTY_VECTOR = vector.zero;
const EMPTY_CFRAME = new CFrame(0, 0, 0);
const templatePart = new Instance('Part');
{
  templatePart.Parent = Workspace;
  templatePart.Anchored = true;
  templatePart.CanCollide = false;
  templatePart.Transparency = 0;
  templatePart.CastShadow = false;
  templatePart.Shape = Enum.PartType.Block;
}

const partCache = new AutoCache(templatePart, 1000, undefined);

//functions
function squareMagnitude(position: vector): number {
  return position.x * position.x + position.y * position.y + position.z * position.z;
}

// function GetNodePositionAndSize(BinaryOctree : BinaryOctree,Node : number) : (Vector3,Vector3)
// 	local NumberLength = math.max(32-bit32.countlz(Node), 0) - 1
// 	local Position = Vector3.zero
// 	local HalfSize = BinaryOctree.Size / 4
// 	HalfSize = Vector3.new(HalfSize,HalfSize,HalfSize)

// 	for Index = 1,NumberLength,3 do
// 		local Suffix = bit32.extract(Node,NumberLength - Index - 2,3)

// 		Position = Position + (HalfSize * SuffixToOrder[Suffix + 1])

// 		Index += 3
// 		HalfSize = HalfSize / 2
// 	end

// 	return BinaryOctree.OffsetPosition + Position,HalfSize * 2
// end

type item = Part | Model;

//Used purely for the destruction aspect.
export class NodeTree {
  public cFrame: CFrame = EMPTY_CFRAME;
  public size: vector = EMPTY_VECTOR;
  public children: [[item]] = [[]] as unknown as [[item]];
  // public childNodes: [[NodeTree]] = [[]] as unknown as [[NodeTree]];
  // public depth: number = 0;
  public maxDepth: number = 2;
  constructor(
    cFrame: CFrame,
    size: vector,
    children?: [[item]],
    // childNodes?: [[NodeTree]],
    depth?: number,
    maxDepth?: number
  ) {
    //const newVector: vector = newVector(x, y, z);

    this.cFrame = cFrame; //need cframes so I can use ToWorldSpace and position stuff sensibly.
    this.size = size;
    if (children !== undefined) {
      this.children = children;
    }
    // if (childNodes !== undefined) {
    //   this.childNodes = childNodes;
    // }
    // if (depth !== undefined) {
    //   this.depth = depth;
    // }
    if (maxDepth !== undefined) {
      this.maxDepth = maxDepth;
    }
  }

  //instead of having a getposition function, we can cache the global vector positions of each.
  //we dont need the whole cframe
  // _getPosition() {}
  _getNodeOffsetAndSize(node: number) {
    const position = this.cFrame.Position as unknown as vector;
    //the length of the binary sequence for our node number
    //we subtract one because the for loop will run at least once
    //additionally, NumberLength should always be a multiple of 3, because its only possible for us to get certain nodes, ie those in: 1 U [8,15] U [64,71] etc
    const binaryLength = math.max(32 - bit32.countlz(node), 0) - 1;
    let [stepX, stepY, stepZ] = [this.size.x / 4, this.size.y / 4, this.size.z / 4];
    let newPosition = [0, 0, 0];
    //traverse through the multiple of 3 by 3s

    for (let i = 1; i <= binaryLength; i += 3) {
      //from right to left, extract 3 bits from the binary sequence and convert it to an actual number
      const octreePositionIndex = bit32.extract(node, binaryLength - i - 2, 3) + 1;
      const octreePosition = octreePositions[octreePositionIndex - 1];
      const stepAxes = [
        //hi
        stepX * octreePosition.x,
        stepY * octreePosition.y,
        stepZ * octreePosition.z
      ];
      //we only need to make a vector of this at the end. for now, we use an array, since theyre slightly faster
      newPosition = [
        newPosition[0] + stepAxes[0],
        newPosition[1] + stepAxes[1],
        newPosition[2] + stepAxes[2]
      ];
      // i += 3;
      [stepX, stepY, stepZ] = [stepX / 2, stepY / 2, stepZ / 2];
    }
    return [
      vector.create(
        newPosition[0], //  + position.x
        newPosition[1], //  + position.y
        newPosition[2] //   + position.z
      ),
      vector.create(stepX * 4, stepY * 4, stepZ * 4)
    ];
  }
  // 	local NumberLength = math.max(32-bit32.countlz(Node), 0) - 1
  // 	local Position = Vector3.zero

  // 	for Index = 1,NumberLength,3 do
  // 		local Suffix = bit32.extract(Node,NumberLength - Index - 2,3)

  // 		Position = Position + (HalfSize * SuffixToOrder[Suffix + 1])

  // 		Index += 3
  // 		HalfSize = HalfSize / 2
  // 	end

  // 	return BinaryOctree.OffsetPosition + Position,HalfSize * 2
  // end
  display(shape: 'Block' | 'Ball', node?: number, time?: number) {
    const children = this.children;
    let startingNode = 1;
    if (node !== undefined) startingNode = node;
    // task.wait(2);
    // print(children[startingNode * 8], startingNode, children);
    //if the node has children...
    if (children[startingNode * 8] !== undefined) {
      for (let i = 0; i <= 7; i++) {
        this.display(shape, startingNode * 8 + i);
      }
    } else {
      const nodePart = partCache.get() as Part;
      nodePart.Color = Color3.fromRGB(
        // math.random(1, 255),
        // math.random(1, 255),
        // math.random(1, 255)
        255,
        255,
        0
      );
      const [position, size] = this._getNodeOffsetAndSize(startingNode);

      nodePart.Size = size as unknown as Vector3;
      //will optimize further later by calcing the new size in the previous function and sending it to the children
      //alsoo need to do a less.. silly calc in general

      nodePart.Shape = Enum.PartType[shape];
      nodePart.Parent = Workspace;
      nodePart.CFrame = this.cFrame.ToWorldSpace(
        new CFrame(position as unknown as Vector3)
      );
      if (time !== undefined) {
        task.spawn(function () {
          task.wait(time);
          partCache.return(nodePart);
        });
      }
    }
  }

  divide8(node: number, timesToDivide: number, divisions?: number) {
    // const depth = this.depth;
    // const childNodes = this.childNodes;
    if (divisions === undefined) divisions = 0;
    const children = this.children;
    const shiftedNode = node * 8; //children are at
    let newNodes: number[] = [] as unknown as number[];

    if (divisions >= timesToDivide) return newNodes;
    for (let i = 0; i <= 7; i++) {
      children[shiftedNode + i - 1] = [] as unknown as [item];
      const additions: number[] = this.divide8(
        shiftedNode + i,
        timesToDivide,
        divisions + 1
      );
      newNodes.push(shiftedNode + i);
      newNodes = [...newNodes, ...additions];
      // this.subNodes[shiftedNode + i] = [];
    }
    return newNodes;
  }
}

//const SubdivideThreshold = 1 //replacing with a per-octree solution

// const SuffixToOrder = table.freeze({
// 	newVector(-1,-1,-1),
// 	newVector(-1,-1,1),
// 	Vector3.new(-1,1,-1), --2
// 	Vector3.new(-1,1,1),  --3
// 	Vector3.new(1,-1,-1), --4
// 	Vector3.new(1,-1,1),  --5
// 	Vector3.new(1,1,-1),  --6
// 	Vector3.new(1,1,1),   --7
// })
