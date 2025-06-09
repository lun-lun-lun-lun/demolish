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
const BOX_SPHERE_CONSTANT = math.sqrt(3) / 2;
const octreePositions = table.freeze([
  newVector(0, 0, 0),
  newVector(1, 0, 0),
  newVector(0, 1, 0),
  newVector(0, 0, 1),
  newVector(0, 1, 1),
  newVector(1, 0, 1),
  newVector(1, 1, 0),
  newVector(1, 1, 1)
]);
const quadtreePositions = table.freeze([
  //Z is the ignored axis. substitute X with Z if needed.
  newVector(0, 0, 0),
  newVector(1, 0, 0),
  newVector(0, 1, 0),
  newVector(1, 1, 0)
]);
const dualtreePositions = table.freeze([
  //Y and Z are the ignored axes.
  newVector(1, 0, 0),
  newVector(0, 0, 0)
]);

const EMPTY_VECTOR = vector.zero;
const EMPTY_CFRAME = new CFrame(0, 0, 0);
const templatePart = new Instance('Part');
{
  templatePart.Parent = Workspace;
  templatePart.Anchored = true;
  templatePart.CanCollide = false;
  templatePart.Transparency = 0.5;
  templatePart.CastShadow = false;
  templatePart.Shape = Enum.PartType.Block;
}

const partCache = new AutoCache(templatePart, 500, undefined);

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
  public maxDepth: number = 5;
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

  display(shape: 'Block' | 'Ball', node?: number, cframe?: CFrame) {
    const baseSize = this.size;
    const children = this.children;
    let startingNode = 1;
    if (node !== undefined) startingNode = node;
    let partCframe = this.cFrame;
    if (cframe !== undefined) partCframe = cframe;
    const position = partCframe.Position;
    if (children[startingNode * 8] !== undefined) {
      for (let i = 0; i <= 7; i++) {
        //we'll need to add additional handling for divide2 and divide4 later, this is a start
        //if theres less than 8 siblings, stop and assume the parent node did divide2 or divide4
        // if (children[startingNode * 8 + i] === undefined) {
        //   break;
        // }

        // const newPosition = newVector(position.X);
        this.display(shape, startingNode * 8 + i, cframe);
      }
    } else {
      const nodePart = partCache.get() as Part;
      nodePart.Color = Color3.fromRGB(
        math.clamp(startingNode * 1.5, 1, 255),
        math.clamp(startingNode * 1, 1, 255),
        math.clamp(startingNode * 2, 1, 255)
      );
      nodePart.CFrame = partCframe;
      nodePart.Size = this.size as unknown as Vector3;
      nodePart.Parent = Workspace;
      nodePart.Shape = Enum.PartType[shape];
      print(children, startingNode);
    }

    //

    // while #UnvisualisedNodes > 0 do
    //   local Node = table.remove(UnvisualisedNodes)
    //   local NodePosition = GetNodePositionAndSize(BinaryOctree,Node[1])

    //   MakeVisualisePart(Node.Size,NodePosition,Node[1])

    //   for i = 0,7 do
    //     local HashIndex = Node[1] * 8 + i

    //     if BinaryOctree.Nodes[HashIndex] == nil then continue end

    //     table.insert(UnvisualisedNodes,{HashIndex, Size = Node.Size / 2})
    //   end
    // end

    // const depth = this.depth;
  }

  divide8(node: number) {
    // const depth = this.depth;
    // const childNodes = this.childNodes;
    const children = this.children;
    const shiftedNode = node * 8; //children are at
    for (let i = 0; i <= 7; i++) {
      children[shiftedNode + i] = [] as unknown as [item];
      // this.subNodes[shiftedNode + i] = [];
    }
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
