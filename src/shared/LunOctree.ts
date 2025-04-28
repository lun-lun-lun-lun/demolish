//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { boxInSphere } from './CollisionCheck';
import { sphereInSphere } from './CollisionCheck';
import { boxInBox } from './CollisionCheck';

//Types in TS us PascalCase
type NewVector3 = ReturnType<typeof vector.create>;
type Vector3Table = { x: number; y: number; z: number };
type Vector3Tuple = [number, number, number];
type OctreeDetected = [Instance] | [];
type ShapeTypes = 'box' | 'sphere';

const EmptyVector3 = vector.create(0, 0, 0);
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

//since I have to use OOP, i'll use it for this
export class OctreeNode {
  //the luau doesnt abide by public and private, but its nice for organization anyways.
  public position: NewVector3 = EmptyVector3;
  public size: NewVector3 = EmptyVector3;
  public maxDepth: number = 5;
  public minSize: number = 50;
  public lenientMinSize: boolean = true; //All 3 axis have to be below minSize to stop subdivision.
  public depth: number = 0;
  public originNode: OctreeNode | undefined = undefined;
  public parentNode: OctreeNode | undefined = undefined;
  public childNodes: OctreeNode[] = [];

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
    this.originNode = originNode;
    this.parentNode = parentNode;
    //show  avisual representation
    this.display('Block');
  }

  display(shape: 'Block' | 'Ball') {
    const nodePart = templatePart.Clone();
    nodePart.Color = Color3.fromRGB(
      math.random(1, 255),
      math.random(1, 255),
      math.random(1, 255)
    );
    nodePart.Position = vectorToVector3(this.position);
    nodePart.Size = vectorToVector3(this.size);
    nodePart.Parent = Workspace;
    nodePart.Shape = Enum.PartType[shape];
  }

  divide(
    timesToDivide: number,
    currentDivision: number | undefined
  ) {
    //these values are defined here so they dont have to be searched for 8 times in the loop
    //is this a microoptimization? perhaps
    const depth = this.depth;
    const maxDepth = this.maxDepth;
    const minSize = this.minSize;
    const lenientMinSize = this.lenientMinSize;
    const originNode = this.originNode || this; //if an origin exists use that. otherwise say we're the origin
    const size = this.size;
    const [sizeX, sizeY, sizeZ] = [size.x, size.y, size.z];
    const [stepX, stepY, stepZ] = [
      sizeX / 2,
      sizeY / 2,
      sizeZ / 2
    ];
    const [offsetX, offsetY, offsetZ] = [
      -stepX / 2 + originNode.position.x,
      stepY - stepY / 2 + originNode.position.y,
      -stepZ / 2 + originNode.position.z
    ];
    const newSize = vector.create(
      sizeX / 2,
      sizeY / 2,
      sizeZ / 2
    );
    //create 8 properly sized, equally spaced nodes within the AABB of the Octree
    for (let y = 0; y < 2; y++) {
      const newY = stepY * -y + offsetY;
      for (let z = 0; z < 2; z++) {
        const newZ = stepZ * z + offsetZ;
        for (let x = 0; x < 2; x++) {
          const newX = stepX * x + offsetX;
          const newPosition = vector.create(newX, newY, newZ);
          const newNode = new OctreeNode(
            newPosition,
            newSize,
            depth + 1,
            maxDepth,
            minSize,
            lenientMinSize,
            this.originNode,
            this
          );
          this.childNodes.push(newNode);
          const realCurrentDivision =
            currentDivision === undefined ? 1 : currentDivision;
          print(realCurrentDivision);
          print(currentDivision, realCurrentDivision);
          if (realCurrentDivision < 2) {
            print('we should divide');
            newNode.divide(
              timesToDivide,
              realCurrentDivision + 1
            );
          }
          //task.wait(0);
          //newNode.display('Block');
        }
      }
    }
  }

  query(
    hitboxShape: ShapeTypes,
    hitboxPosition: NewVector3,
    hitboxRotation: NewVector3,
    hitboxSize: NewVector3,
    octreeShape: ShapeTypes //treat each position as a sphere, or a cube?
  ) {
    if (octreeShape === 'sphere') {
      //sphere
    } else {
      //box
    }
    //spherical octree for querying
    //makes more sense for my weird OBBs
    //Dynamic BVH would also make sense to do for hitbox queries, but nahhhh... too long to make.
    //less computational cost per query that way
    //skip to lowest octree children? No, there'd be too many to calculate, it'd be unnecessary
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

export default {
  create: Create
};
//"hi"
