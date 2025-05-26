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

const EMPTY_VECTOR = vector.create(0, 0, 0);
const EMPTY_CFRAME = new CFrame(0, 0, 0);
const templatePart = new Instance('Part');
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

type sizeType = vector | number;
export class SpheretreeNode extends OctreeNode<Part> {
  public childNodes: Map<vector, OctreeNode<Part>> = new Map();
  public contains: Map<vector, Part> = new Map();
  public shape: ShapeTypes = 'box';
  public depth = 0;
  public depthLimit = 3;
  public divisionThreshold = 10; //this was zero before and would have obliterated my pc lmao
  public radius: number;
  //public shape: ShapeTypes = 'box';z
  constructor(
    //might change from cframe to position now that this is a spheretree?
    cFrame: CFrame,
    radius: number,
    shape: ShapeTypes,
    divisionThreshold: number = 5,
    depthLimit: number = 5,
    contains?: Map<vector, Part>,
    depth?: number
  ) {
    //const newVector: vector = vector.create(x, y, z);
    super(cFrame, vector.create(radius, radius, radius));
    this.shape = shape;
    this.radius = radius;
    this.divisionThreshold = divisionThreshold;
    this.depthLimit = depthLimit;
    if (contains !== undefined) {
      this.contains = contains;
    }
    if (depth !== undefined) {
      this.depth = depth;
    }
  }

  _update(item: Part, newPosition: vector) {
    //
  }

  _remove(position: vector, item: Part) {}

  _insert(position: vector, item: Part) {
    this.contains.set(position, item as Part);

    //if too many objects, divide
    if (
      this.contains.size() > this.divisionThreshold &&
      this.depth + 1 <= this.depthLimit
    ) {
      print('UNDERLIMIT');
      this.childNodes = this.divideOctree<Part>();
    }
    //its not letting me reference 'this' inside of the position change function, so mean
    const nodePosition = this.cFrame.Position;
    const nodeRadius = this.radius; //should make sure radius isn't being used or set as diameter in places
    //since we approximate all objs into their bounding radiuses, we don't care about the rotation.
    //in the future, when I want to deal with items that have extreme sizes, i'll need to change this. Or not. Idc.
    item.GetPropertyChangedSignal('Position').Connect(function () {
      print('pos change');
      const itemPosition = item.Position;
      const vectorDifference = nodePosition.sub(itemPosition);
      const distance = vectorDifference.Magnitude;
      //since the spheres will overlap, I need to divide the node radius by the overlap and create a check for that as well.
      //im jsut guessingone what the overlap will be
      if (distance > nodeRadius + nodeRadius / math.pi) {
        //
      }
    });
  }

  tryInsert(
    itemLocation: vector | CFrame,
    itemSize: vector | number,
    itemShape: ShapeTypes,
    itemToInsert: Part
  ) {
    print('INSERT ATTEMPT');
    let touching = false;
    let itemPosition;

    if (itemShape === 'box') {
      itemPosition = (itemLocation as CFrame).Position as unknown as vector;
      touching = boxInSphere(
        itemLocation as CFrame,
        itemSize as vector,
        this.cFrame.Position as unknown as vector,
        this.radius
      );
    } else if (itemShape === 'sphere') {
      itemPosition = itemLocation as vector;
      touching = sphereInSphere(
        itemPosition as vector,
        itemSize as number,
        this.cFrame.Position as unknown as vector,
        this.radius
      );
    }
    if (touching === true) {
      this._insert(itemPosition as vector, itemToInsert);
    }
  }

  query(hitboxCframe: CFrame, hitboxSize: vector, hitboxShape: ShapeTypes) {
    // for (const item of this.contains) {
    //   //collision checker logic
    // }
  }

  divideOctree<insertType>() {
    //these values are defined here so they dont have to be searched for 8 times in the loop
    //is this a microoptimization? perhaps
    // const childNodes: { [key: string]: OctreeNode } =
    //   {} as unknown as { [key: string]: OctreeNode };
    const [cFrame, radius, shape, divisionThreshold, depthLimit, contains, depth] = [
      this.cFrame,
      this.radius,
      this.shape,
      this.divisionThreshold,
      this.depthLimit,
      this.contains,
      this.depth + 1
    ];
    const childNodes = new Map<vector, SpheretreeNode>();
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
      const newNode = new SpheretreeNode(
        cFrame,
        radius / 4,
        shape,
        divisionThreshold,
        depth,
        new Map(),
        depth + 1
      );
      const newPosition = newCframe.Position;
      childNodes.set(newPosition as unknown as vector, newNode);

      //to improev
      for (const [position, item] of contains) {
        const itemSize = item.Size;

        //for now i'll have these as spheres, but if I want to include other shapes i'll probably have to use CFrames as keys or change how my collision detection works
        this.tryInsert(
          position,
          math.max(itemSize.X, itemSize.Y, itemSize.Z) as unknown as number,
          'sphere',
          item
        );
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
