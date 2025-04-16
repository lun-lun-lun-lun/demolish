//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
type NewVector3 = ReturnType<typeof vector.create>;
type Vector3Table = { x: number; y: number; z: number };
type Vector3Tuple = [number, number, number];
type OctreeDetected = [Instance] | [];
const emptyVector3 = vector.create(0, 0, 0);

//since I have to use OOP, i'll use it for this

class OctreeNode {
  //the luau doesnt abide by public and private, but its nice for organization anyways.
  public position: NewVector3 = emptyVector3;
  public size: NewVector3 = emptyVector3;
  public maxDepth: number = 5;
  public minSize: number = 50;
  public lenientMinSize: boolean = true; //All 3 axis have to be below minSize to stop subdivision.
  public depth: number = 0;
  public originNode: OctreeNode | undefined = undefined;
  public parentNode: OctreeNode | undefined = undefined;
  public childNodes: [OctreeNode] | undefined = undefined;
  public detected: OctreeDetected = [];
  constructor(
    position: NewVector3,
    size: NewVector3,
    depth: number,
    maxDepth: number,
    minSize: number,
    lenient: boolean,
    originNode: OctreeNode | undefined,
    parentNode: OctreeNode | undefined
  ) {
    //const newVector: vector = vector.create(x, y, z);

    this.position = position;
    this.size = size;
    this.maxDepth = maxDepth;
    this.minSize = minSize;
    this.lenientMinSize = lenient;
    this.depth = depth;
    this.originNode =
      originNode !== undefined ? originNode : undefined;
    this.parentNode =
      parentNode !== undefined ? parentNode : undefined;
  }

  divide(timestoDivide: number) {
    // const maxSizeX = math.max(this.size.x);
    // const maxSizeY = math.max(this.size.y);
    // const maxSizeZ = math.max(this.size.z);
    const size = this.size;
    const stepX = size.x / 2;
    const stepY = size.y / 2;
    const stepZ = size.z / 2;
    const offsetX = stepX / 2;
    const offsetY = stepY / 2;
    const offsetZ = stepZ / 2;
    for (let y = 0; y < 2; y++) {
      const newY = stepY * y + offsetY;
      for (let z = 0; z < 2; z++) {
        const newZ = stepZ * z + offsetZ;
        for (let x = 0; x < 2; x++) {
          const newX = stepX * x + offsetX;
          const newPosition = vector.create(newX, newY, newZ);
          const newSize = 
        }
      }
    }
  }
}

export function Create(
  px: number,
  py: number,
  pz: number,
  sx: number,
  sy: number,
  sz: number,
  maxDepth: number,
  minSize: number,
  lenientMinSize: boolean
) {
  //do sum
  const position: NewVector3 = vector.create(px, py, pz);
  const size: NewVector3 = vector.create(sx, sy, sz);
  const newOctree = new OctreeNode(
    position,
    size,
    0,
    maxDepth,
    minSize,
    lenientMinSize,
    undefined,
    undefined
  );

  return newOctree;
}

export function Subdivide(timesToSubdivide: number) {
  //do sum
  // const position: NewVector3 = vector.create(px, py, pz);
  // const size: NewVector3 = vector.create(sx, sy, sz);
  // const newOctree = new OctreeNode(position, size, 5, true);
  // return newOctree;
}
export default {
  create: Create
};
//"hi"
