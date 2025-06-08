//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { AutoCache } from 'shared/AutoCache';
import { boxInSphere } from './CollisionCheck';
import { sphereInSphere } from './CollisionCheck';
import { boxInBox } from './CollisionCheck';

//Types in TS us PascalCase
type Vector3Table = { x: number; y: number; z: number };
type Vector3Tuple = [number, number, number];
type OctreeDetected = [Instance] | [];
type ShapeTypes = 'box' | 'sphere';
type sizeType = vector | number;

const EMPTY_VECTOR = vector.zero;
const EMPTY_CFRAME = new CFrame(0, 0, 0);
const templatePart = new Instance('Part');
const BOX_SPHERE_CONSTANT = math.sqrt(3) / 2;
templatePart.Parent = Workspace;
templatePart.Anchored = true;
templatePart.CanCollide = false;
templatePart.Transparency = 0.5;
templatePart.CastShadow = false;
templatePart.Shape = Enum.PartType.Block;

//I have to rewrite the octrees because there is a faster, smarter way to store the objects (using bitwise operations)

//typescript is being REALLY annoying about vector and vector3s when they use the exact same type as of april
function vectorToVector3(vector: vector): Vector3 {
  return new Vector3(vector.x, vector.y, vector.z);
}

const newVector = vector.create;
const BOTTOM_NODES = table.freeze([3, 5, 7, 8]);
const TOP_NODES = table.freeze([1, 2, 4, 6]);
//octree
const octreeDivisionPositions = table.freeze([
  //since we already know all unique step configurations for octrees, we dont need to use a for loop to find them
  newVector(0, 0, 0),

  newVector(1, 0, 0),
  newVector(0, 1, 0),
  newVector(0, 0, 1),

  newVector(0, 1, 1),
  newVector(1, 0, 1),
  newVector(1, 1, 0),

  newVector(1, 1, 1)
]);

//quadtree
const quadtreeDivisionPositions = table.freeze([
  //Z is the ignored axis. replace X with Z if needed.
  newVector(0, 0, 0),
  newVector(1, 0, 0),
  newVector(0, 1, 0),
  newVector(1, 1, 0)
]);

//dualtree
const dualtreeDivisionPositions = [
  //Y and Z are the ignored axes here. Replace X with Y or Z if needed.
  newVector(1, 0, 0),
  newVector(0, 0, 0)
];

const partCache = new AutoCache(templatePart, 500, undefined);
//since I have to use OOP, i'll use it for this
export class OctreeNode<containType> {
  //the luau doesnt abide by public and private, but its nice for organization anyways.
  public cFrame: CFrame = EMPTY_CFRAME;
  public size: vector = EMPTY_VECTOR;
  constructor(cFrame: CFrame, size: vector) {
    //const newVector: vector = newVector(x, y, z);

    this.cFrame = cFrame; //need cframes so I can use ToWorldSpace and position stuff sensibly.
    this.size = size;
  }

  display(shape: 'Block' | 'Ball') {
    const nodePart = partCache.get() as Part;
    // const nodePart = templatePart.Clone();
    nodePart.Color = Color3.fromRGB(
      math.random(1, 255),
      math.random(1, 255),
      math.random(1, 255)
    );
    nodePart.CFrame = this.cFrame;
    nodePart.Size = this.size as unknown as Vector3;
    nodePart.Parent = Workspace;
    nodePart.Shape = Enum.PartType[shape];
  }

  divideOctree<insertType>(timesToDivide: number, currentDivision?: number) {
    //these values are defined here so they dont have to be searched for 8 times in the loop
    //is this a microoptimization? perhaps
    // const childNodes: { [key: string]: OctreeNode } =
    //   {} as unknown as { [key: string]: OctreeNode };
    const childNodes = new Map<vector, OctreeNode<insertType>>();
    const size = this.size;
    const [sizeX, sizeY, sizeZ] = [size.x, size.y, size.z];
    const [stepX, stepY, stepZ] = [sizeX / 2, sizeY / 2, sizeZ / 2];
    const [offsetX, offsetY, offsetZ] = [-stepX / 2, -stepY / 2, -stepZ / 2];
    const newSize = newVector(stepX, stepY, stepZ);
    const newNodes = [];

    //create 8 properly sized, equally spaced nodes within the AABB of the Octree
    for (const stepChange of octreeDivisionPositions) {
      const positionOffset = new CFrame(
        stepChange.x * stepX + offsetX,
        stepChange.y * stepY + offsetY,
        stepChange.z * stepZ + offsetZ
      );
      const newCframe = this.cFrame.ToWorldSpace(positionOffset);
      const newNode = new OctreeNode(newCframe, newSize);
      const newPosition = newCframe.Position;
      childNodes.set(newPosition as unknown as vector, newNode);
      newNodes.push(newNode);
      const realCurrentDivision = currentDivision !== undefined ? currentDivision : 1;
      if (realCurrentDivision < timesToDivide) {
        newNode.divideOctree(1, realCurrentDivision + 1);
      }
    }
    return newNodes;
  }
}

//I gave these simple functions names because I know I'll forget how later
function getBoundingSpherePart(part: Part) {
  return part.Size.Magnitude;
}
function getBoundingSphereModel(model: Model) {
  const [modelCframe, modelSize] = model.GetBoundingBox();
  return modelSize.Magnitude / 2;
}

interface treeChildItem {
  boundingRadius: number;
}
type childTreeMap = Map<vector, SpheretreeNode>;
type childItemMap = Map<vector, [Part | Model, number]>;

export class SpheretreeNode extends OctreeNode<Part> {
  public position: vector = EMPTY_VECTOR;
  public radius: number = 0;

  public childTrees: childTreeMap = new Map() as unknown as childTreeMap;
  public childItems: childItemMap = new Map() as unknown as childItemMap;

  public depth: number = 0;
  public maxDepth: number = 3;
  public divisionThreshold: number = 3;
  constructor(
    position: vector,
    radius: number,
    depth: number,
    maxDepth?: number,
    divisionThreshold?: number,
    display?: boolean
  ) {
    super(
      new CFrame(position.x, position.y, position.z),
      newVector(radius, radius, radius)
    );
    this.position = position;
    this.radius = radius;
    this.depth = depth;
    if (maxDepth !== undefined) {
      this.maxDepth = maxDepth;
    }
    if (divisionThreshold !== undefined) {
      this.divisionThreshold = divisionThreshold;
    }
    if (display) {
      this.display('Ball');
    }
  }

  removeItem(itemPosition: vector) {
    //
  }

  _insertItem(
    itemPosition: vector,
    item: Part | Model,
    itemRadius: number,
    childItems: childItemMap
  ) {
    //
    childItems.set(itemPosition, [item, itemRadius]);
  }

  //insert a list of parts/models if they're touching the node
  checkInsertItems(potentialHits: [Part | Model]) {
    const threshold = this.divisionThreshold;
    const depth = this.depth;
    const maxDepth = this.maxDepth;
    const childItems = this.childItems;
    const position = this.position;
    const radius = this.radius;
    const childRadius = radius / 2;
    const childBoxSize = childRadius / BOX_SPHERE_CONSTANT; //should probably make sure that this is correct...2

    //the most the sphere extends
    const childExtraCut = childRadius - childBoxSize; //obviously doesn't account for angle, but helps with slightly faster check

    const [positionX, positionY, positionZ] = [position.x, position.y, position.z];
    const bottomNodesTop = positionY + childExtraCut;
    const topNodesBottom = positionY - childExtraCut;
    let insertions = 0;
    let mustDivide = false;
    const bottomItems = [];
    const topItems = [];
    for (const item of potentialHits) {
      let itemRadius: number;
      let itemPosition: vector;

      if (item.IsA('Part')) {
        itemRadius = getBoundingSpherePart(item);
        itemPosition = item.Position as unknown as vector;
      } else {
        itemRadius = getBoundingSphereModel(item);
        itemPosition = item.GetPivot().Position as unknown as vector;
      }

      const itemTop = itemPosition.y + itemRadius / 2;
      const itemBottom = itemPosition.y - itemRadius / 2;

      if (sphereInSphere(itemPosition, itemRadius, position, this.radius) === true) {
        //i put the size in the [] so I don't have to re-calc the size of it each time
        //i'll make another thing for updating size and position later
        childItems.set(itemPosition, [item, itemRadius]);
        insertions++;

        if (itemBottom > bottomNodesTop) {
          //the item is assuredly above the bottom nodes, so we only need to check the top nodes.
          topItems.push(item);
        } else if (itemTop < topNodesBottom) {
          //the item is assuredly below the top nodes, so we only need to check the bottom nodes.
          bottomItems.push(item);
        }
      }

      if (insertions >= threshold && depth + 1 <= maxDepth) {
        mustDivide = true;
      }
    }

    if (mustDivide === true) {
      //split and redistribute
      const possibleHitNodes = this.divideOctree(1);

      for (const i of BOTTOM_NODES) {
        for (const item of bottomItems) {
          possibleHitNodes[i].checkInsertItems([item]);
        }
      }
      for (const i of TOP_NODES) {
        for (const item of topItems) {
          possibleHitNodes[i].checkInsertItems([item]);
        }
      }
    }
  }

  //divide the spheretree into 8 equally spaced sub-spheres
  divideOctree(timesToDivide: number, currentDivision?: number) {
    //these values are defined here so they dont have to be searched for 8 times in the loop
    //is this a microoptimization? perhaps
    const childNodes = new Map<vector, SpheretreeNode>();
    const radius = this.radius;
    const step = radius / 2;
    const offset = -step / 2;
    const childRadius = step;
    const stepOffset = step + offset;
    const position = this.position;
    const [positionX, positionY, positionZ] = [position.x, position.y, position.z];
    const depth = this.depth;
    const maxDepth = this.maxDepth;
    const divisionThreshold = this.divisionThreshold;
    const newNodes = [];
    //create 8 properly sized, equally spaced nodes within the AABB of the Octree
    for (const stepChange of octreeDivisionPositions) {
      const childPosition = newVector(
        positionX + stepChange.x * stepOffset,
        positionY + stepChange.y * stepOffset,
        positionZ + stepChange.z * stepOffset
      );
      const newNode = new SpheretreeNode(
        childPosition,
        childRadius,
        depth + 1,
        maxDepth,
        divisionThreshold
      );

      childNodes.set(childPosition as unknown as vector, newNode);
      newNodes.push(newNode);
      const realCurrentDivision = currentDivision !== undefined ? currentDivision : 1;
      if (realCurrentDivision < timesToDivide) {
        newNode.divideOctree(1, realCurrentDivision + 1);
      }
    }
    return newNodes;
  }
}

export function Create(cFrame: CFrame, size: vector) {
  const newOctree = new OctreeNode(cFrame, size);

  return newOctree;
}

export default {
  create: Create
};
//"hi"
