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

//typescript is being REALLY annoying about vector and vector3s when they use the exact same type as of april
function vectorToVector3(vector: vector): Vector3 {
  return new Vector3(vector.x, vector.y, vector.z);
}

const newVector = vector.create;
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
  //public contains: Map<NewVector3, containType> = new Map();
  //public shape: ShapeTypes = 'box';
  constructor(
    cFrame: CFrame,
    size: vector
    //shape: ShapeTypes
    //depth: number,
    //maxDepth: number,
    //minSize: number,
    //lenient: boolean,
    //originNode: OctreeNode | undefined,
    //parentNode: OctreeNode | undefined
  ) {
    //const newVector: vector = vector.create(x, y, z);

    this.cFrame = cFrame; //need cframes so I can use ToWorldSpace and position stuff sensibly.
    this.size = size;
    //this.shape = shape;

    // this.maxDepth = maxDepth;
    // this.minSize = minSize;
    // this.lenientMinSize = lenient;
    // this.depth = depth;
    // this.originNode = originNode;
    // this.parentNode = parentNode;
    //show a visual representation
    // this.display('Block');
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

      const realCurrentDivision = currentDivision !== undefined ? currentDivision : 1;
      if (realCurrentDivision < timesToDivide) {
        newNode.divideOctree(1, realCurrentDivision + 1);
      }
    }
    return childNodes;
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
    divisionThreshold?: number
  ) {
    super(
      new CFrame(position.x, position.y, position.z),
      vector.create(radius, radius, radius)
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
  }

  //insert a list of parts/models if they're touching the node
  checkInsert(potentialHits: [Part | Model]) {
    const threshold = this.divisionThreshold;
    const depth = this.depth;
    const maxDepth = this.maxDepth;
    const childItems = this.childItems;
    const position = this.position;
    let insertions = 0;

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

      if (sphereInSphere(itemPosition, itemRadius, this.position, this.radius) === true) {
        //i put the size in the [] so I don't have to re-calc the size of it each time
        //i'll make another thing for updating size and position later
        childItems.set(itemPosition, [item, itemRadius]);
        insertions++;
      }

      if (insertions >= threshold && depth + 1 <= maxDepth) {
        //split and redistribute
        const childNodes = this.divideOctree(1);
        for (const [itemPosition, [item, itemRadius]] of childItems) {
          //
          //get distance from positions as a vector
          //check if the bottom part of the item's bounding sphere is definitely above/below/away from other spheres using that lines x, y, and z
        }
      }
    }
  }

  //divide the spheretree into 8 equally spaced sub-spheres
  divideOctree(timesToDivide: number, currentDivision?: number) {
    //these values are defined here so they dont have to be searched for 8 times in the loop
    //is this a microoptimization? perhaps
    // const childNodes: { [key: string]: OctreeNode } =
    //   {} as unknown as { [key: string]: OctreeNode };
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
    //create 8 properly sized, equally spaced nodes within the AABB of the Octree
    for (const stepChange of octreeDivisionPositions) {
      const childPosition = vector.create(
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

      const realCurrentDivision = currentDivision !== undefined ? currentDivision : 1;
      if (realCurrentDivision < timesToDivide) {
        newNode.divideOctree(1, realCurrentDivision + 1);
      }
    }
    return childNodes;
  }
}

export function Create(
  cFrame: CFrame,
  size: vector
  // sx: number,
  // sy: number,
  // sz: number,
  // maxDepth: number,
  // minSize: number,
  // lenientMinSize: boolean
  //shape: ShapeTypes
) {
  print('octree born');
  //do sum
  //const position: NewVector3 = vector.create(px, py, pz);
  // const size: NewVector3 = vector.create(sx, sy, sz);
  const newOctree = new OctreeNode(
    cFrame,
    size
    //shape
    // 0,
    // maxDepth,
    // minSize,
    // lenientMinSize,
    // undefined,
    // undefined
  );

  return newOctree;
}

export default {
  create: Create
};
//"hi"
