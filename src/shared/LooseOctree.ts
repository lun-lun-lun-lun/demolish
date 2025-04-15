//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
type NewVector3 = ReturnType<typeof vector.create>;
type Vector3Table = { x: number; y: number; z: number };
type Vector3Tuple = [number, number, number];

const emptyVector3 = vector.create(0, 0, 0);

class LooseOctree {
  position: NewVector3 = emptyVector3;
  size: NewVector3 = emptyVector3;
  maxDepth: number = 5;
  minSize: number = 50;
  lenientMinSize: boolean = true; //All 3 axis have to be below minSize to stop subdivision.
  contains: [] = [];
  constructor(
    position: NewVector3,
    size: NewVector3,
    maxDepth: number,
    minSize: number,
    lenient: boolean
  ) {
    //const newVector: vector = vector.create(x, y, z);

    this.position = position;
    this.size = size;
    this.maxDepth = maxDepth;
    this.minSize = minSize;
    this.lenientMinSize = lenient;
  }
}

export function Create(
  px: number,
  py: number,
  pz: number,
  sx: number,
  sy: number,
  sz: number
) {
  //do sum
  const position: NewVector3 = vector.create(px, py, pz);
  const size: NewVector3 = vector.create(sx, sy, sz);
  const newOctree = new LooseOctree(position, size, 5, 50, true);

  return newOctree;
}

export function Subdivide(timesToSubdivide: number) {
  //do sum
  // const position: NewVector3 = vector.create(px, py, pz);
  // const size: NewVector3 = vector.create(sx, sy, sz);
  // const newOctree = new LooseOctree(position, size, 5, true);
  // return newOctree;
}
export default {
  create: Create
};
//"hi"
