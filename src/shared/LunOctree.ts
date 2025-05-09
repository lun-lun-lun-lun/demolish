//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { AutoCache } from 'shared/AutoCache';
import { boxInSphere } from './CollisionCheck';
import { sphereInSphere } from './CollisionCheck';
import { boxInBox } from './CollisionCheck';

//Types in TS us PascalCase
type NewVector3 = ReturnType<typeof vector.create>;
type Vector3Table = { x: number; y: number; z: number };
type Vector3Tuple = [number, number, number];
type OctreeDetected = [Instance] | [];
type ShapeTypes = 'box' | 'sphere';

const sphereBoxCheck = (
  position: vector,
  radius: number,
  params: OverlapParams
) =>
  Workspace.GetPartBoundsInRadius(
    position as unknown as Vector3,
    radius,
    params
  );
const boxBoxCheck = (
  cFrame: CFrame,
  size: vector,
  params: OverlapParams
) =>
  Workspace.GetPartBoundsInBox(
    cFrame,
    size as unknown as Vector3,
    params
  );
const EMPTY_VECTOR = vector.create(0, 0, 0);
const EMPTY_CFRAME = new CFrame(0, 0, 0);
const DEFAULT_PART = new Instance('Part');
DEFAULT_PART.Parent = Workspace;
DEFAULT_PART.Anchored = true;
DEFAULT_PART.CanCollide = false;
DEFAULT_PART.Transparency = 0.5;
DEFAULT_PART.CastShadow = false;
DEFAULT_PART.Shape = Enum.PartType.Block;

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

const partCache = new AutoCache(DEFAULT_PART, 500, undefined);
//since I have to use OOP, i'll use it for this
export class OctreeNode<containType> {
  //the luau doesnt abide by public and private, but its nice for organization anyways.
  public cFrame: CFrame = EMPTY_CFRAME;
  public size: NewVector3 = EMPTY_VECTOR;
  //public contains: Map<NewVector3, containType> = new Map();
  //public shape: ShapeTypes = 'box';
  constructor(
    cFrame: CFrame,
    size: NewVector3
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
    // const nodePart = DEFAULT_PART.Clone();
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

  divideOctree(timesToDivide: number, currentDivision?: number) {
    //these values are defined here so they dont have to be searched for 8 times in the loop
    //is this a microoptimization? perhaps
    // const childNodes: { [key: string]: OctreeNode } =
    //   {} as unknown as { [key: string]: OctreeNode };
    const childNodes = new Map<Vector3, OctreeNode<unknown>>();
    const size = this.size;
    const [sizeX, sizeY, sizeZ] = [size.x, size.y, size.z];
    const [stepX, stepY, stepZ] = [
      sizeX / 2,
      sizeY / 2,
      sizeZ / 2
    ];
    const [offsetX, offsetY, offsetZ] = [
      -stepX / 2,
      -stepY / 2,
      -stepZ / 2
    ];
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
      childNodes.set(newPosition, newNode);

      const realCurrentDivision =
        currentDivision !== undefined ? currentDivision : 1;
      if (realCurrentDivision < timesToDivide) {
        newNode.divideOctree(1, realCurrentDivision + 1);
      }
    }
    return childNodes;
  }
}

export class ShapetreeNode extends OctreeNode<Part> {
  public contains: Map<NewVector3, Part> = new Map();
  public shape: ShapeTypes = 'sphere';
  public depth: number = 0;
  public depthLimit: number = 3;
  public divisionThreshold: number = 0;
  //public shape: ShapeTypes = 'box';
  constructor(
    cFrame: CFrame,
    size: NewVector3,
    shape: ShapeTypes,
    divisionThreshold: number = 5,
    depthLimit: number = 5,
    contains?: Map<NewVector3, Part>,
    depth?: number
    //shape: ShapeTypes
    //depth: number,
    //maxDepth: number,
    //minSize: number,
    //lenient: boolean,
    //originNode: OctreeNode | undefined,
    //parentNode: OctreeNode | undefined
  ) {
    //const newVector: vector = vector.create(x, y, z);
    super(cFrame, size);
    this.shape = shape;
    this.divisionThreshold = divisionThreshold;
    this.depthLimit = depthLimit;
    if (contains !== undefined) {
      this.contains = contains;
    }
    if (depth !== undefined) {
      this.depth = depth;
    }
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
  _insert(position: vector, item: Part) {
    this.contains.set(position, item);
    //if too many objects, divide
  }

  tryInsert(
    itemCframe: CFrame,
    itemSize: NewVector3,
    itemShape: ShapeTypes,
    item: Part
  ) {
    let result = false;
    if (itemShape === 'box') {
      if (this.shape === 'box') {
        result = boxInBox(
          itemCframe,
          itemSize,
          this.cFrame,
          this.size
        );
      }
    } else if (itemShape === 'sphere') {
      print('hi');
    }
  }

  query(
    hitboxCframe: CFrame,
    hitboxSize: NewVector3,
    hitboxShape: ShapeTypes
  ) {
    for (const item of this.contains) {
      //collision checker logic
    }
  }
}

export function Create(
  cFrame: CFrame,
  size: NewVector3
  // sx: number,
  // sy: number,
  // sz: number,
  // maxDepth: number,
  // minSize: number,
  // lenientMinSize: boolean
  //shape: ShapeTypes
) {
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
