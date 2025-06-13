//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { ReplicatedStorage } from '@rbxts/services';
import { RunService } from '@rbxts/services';

import { makeHello } from 'shared/module';

// import LunOctree from 'shared/LunOctree';
// import { SpheretreeNode } from 'shared/LunOctree';
import { NodeTree } from 'shared/NodeTree';
import { SphereTree } from 'shared/NodeTree';

import { partCache } from 'shared/NodeTree';
import { boxInBox } from 'shared/CollisionCheck';
import { sphereInSphere } from 'shared/CollisionCheck';
import { boxInSphere } from 'shared/CollisionCheck';
import JackSpawn from 'shared/JackSpawn';
import cacheControl from 'shared/AutoCache';

interface MapChildren {
  Block1: Part;
  Block2: Part;
  Block3: Part;
  Block4: Part;
  Block5: Part;
}

interface DestroyersChildren {
  RedBall: Part;
}

const DISPLAY_SPHERETREE = false;
const BOX_SPHERE_CONSTANT = math.sqrt(3); //multiply by the CUBE's x, y or z to make a sphere that perfectly consumes it
const WORLD_CENTER = vector.create(0, 20, 0);
const SPHERETREE_RADIUS = 200;
const SPHERETREE_MAX_DEPTH = 5;
const SPHERETREE_MAX_ITEMS = 1; //items before subdivision occurs in that node/cell (i wish i picked the name cell. it sounds cool)
const DEMOLISH_DEPTH = 2;
const map = Workspace.WaitForChild('Map') as Folder & MapChildren;
const destroyers = Workspace.WaitForChild('Destroyers') as Folder & DestroyersChildren;

//get the length of the binary sequence for any number
function getBinaryLength(num: number) {
  return math.max(32 - bit32.countlz(num), 0) - 1;
}

// function demolishBox(part: Part, subtractionPart: Part, divisionLimit?: number) {
//   if (divisionLimit === undefined) divisionLimit = 2;
//   const partCframe = part.CFrame;
//   const partSize = part.Size as unknown as vector;
//   // const spherePosition = subtractionSphere.Position as unknown as vector;
//   // const sphereRadius = subtractionSphere.Size.X / 2;
//   const partTree = new NodeTree(partCframe, partSize);
//   const freeNodes: number[] = [];
//   const hitNodes: number[] = [];
//   if (
//     boxInBox(
//       partCframe,
//       partSize,
//       subtractionPart.CFrame,
//       subtractionPart.Size as unknown as vector
//     )
//   ) {
//     let nodesToCheck = partTree.divide8(1, 1);
//     while (nodesToCheck.size() > 0) {
//       for (let i = nodesToCheck.size(); i > 0; i = i - 1) {
//         const node = nodesToCheck[math.max(i - 1, 0)];
//         const [nodePosition, nodeSize] = partTree._getNodeOffsetAndSize(node);
//         const nodeCframe = partTree.cFrame.ToWorldSpace(
//           new CFrame(nodePosition as unknown as Vector3)
//         );
//         const nodeHit = boxInBox(
//           nodeCframe,
//           nodeSize,
//           subtractionPart.CFrame,
//           subtractionPart.Size as unknown as vector
//         );
//         const underLimit = getBinaryLength(node) / 3 <= divisionLimit;
//         if (nodeHit && underLimit) {
//           const newNodesToCheck = partTree.divide8(node, 1);
//           nodesToCheck.remove(math.max(i - 1, 0));
//           nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
//           // hitNodes.push(node);
//         } else if (nodeHit) {
//           hitNodes.push(node);
//           nodesToCheck.remove(math.max(i - 1, 0));
//         } else {
//           freeNodes.push(node);
//           nodesToCheck.remove(math.max(i - 1, 0));
//         }

//         // print(getBinaryLength(node));

//         // if (nodeHit === true && underLimit === true) {
//         //   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
//         // } else if (nodeHit === false) {
//         //   freeNodes.push(node);
//         //   nodesToCheck.remove(i);
//         // } else if (underLimit === false) {
//         //   hitNodes.push(node);
//         //   nodesToCheck.remove(i);
//         // }
//       }
//     }
//   }

//   return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
// }

// function demolishSphere(part: Part, subtractionPart: Part, divisionLimit?: number) {
//   if (divisionLimit === undefined) divisionLimit = 2;
//   const partCframe = part.CFrame;
//   const partSize = part.Size as unknown as vector;
//   // const spherePosition = subtractionSphere.Position as unknown as vector;
//   // const sphereRadius = subtractionSphere.Size.X / 2;
//   const partTree = new NodeTree(partCframe, partSize);
//   const freeNodes: number[] = [];
//   const hitNodes: number[] = [];
//   if (
//     boxInSphere(
//       partCframe,
//       partSize,
//       subtractionPart.Position as unknown as vector,
//       subtractionPart.Size.X / 2
//     )
//   ) {
//     let nodesToCheck = partTree.divide8(1, 1);
//     while (nodesToCheck.size() > 0) {
//       for (let i = nodesToCheck.size(); i > 0; i = i - 1) {
//         const node = nodesToCheck[math.max(i - 1, 0)];
//         const [nodePosition, nodeSize] = partTree._getNodeOffsetAndSize(node);
//         const nodeCframe = partTree.cFrame.ToWorldSpace(
//           new CFrame(nodePosition as unknown as Vector3)
//         );
//         const nodeHit = boxInSphere(
//           nodeCframe,
//           nodeSize,
//           subtractionPart.Position as unknown as vector,
//           subtractionPart.Size.X / 2
//         );
//         const underLimit = getBinaryLength(node) / 3 <= divisionLimit;
//         if (nodeHit && underLimit) {
//           const newNodesToCheck = partTree.divide8(node, 1);
//           nodesToCheck.remove(math.max(i - 1, 0));
//           nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
//           // hitNodes.push(node);
//         } else if (nodeHit) {
//           hitNodes.push(node);
//           nodesToCheck.remove(math.max(i - 1, 0));
//         } else {
//           freeNodes.push(node);
//           nodesToCheck.remove(math.max(i - 1, 0));
//         }

//         // print(getBinaryLength(node));

//         // if (nodeHit === true && underLimit === true) {
//         //   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
//         // } else if (nodeHit === false) {
//         //   freeNodes.push(node);
//         //   nodesToCheck.remove(i);
//         // } else if (underLimit === false) {
//         //   hitNodes.push(node);
//         //   nodesToCheck.remove(i);
//         // }
//       }
//     }
//   }

//   return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
// }

//demolish a sphere, but approximate nodes into spheres instead of treating them as cubes. Slightly faster since no OBBs are involved.
function demolishSphereFast(part: Part, subtractionPart: Part, divisionLimit?: number) {
  if (divisionLimit === undefined) divisionLimit = 2;
  const partCframe = part.CFrame;
  const partSize = part.Size as unknown as vector;
  const partTree = new NodeTree(partCframe, partSize); //convert part into theoretical nodetree
  const freeNodes: number[] = [];
  const hitNodes: number[] = [];

  //if we're touching....
  if (
    sphereInSphere(
      part.Position as unknown as vector,
      (part.Size.X / 2) * BOX_SPHERE_CONSTANT,
      subtractionPart.Position as unknown as vector,
      subtractionPart.Size.X / 2
    )
  ) {
    //check octants of part
    let nodesToCheck = partTree.divide8(1, 1);
    while (nodesToCheck.size() > 0) {
      for (let i = nodesToCheck.size(); i > 0; i = i - 1) {
        const node = nodesToCheck[math.max(i - 1, 0)];
        const [nodePosition, nodeSize] = partTree._getNodeOffsetAndSize(node);
        const nodeCframe = partTree.cFrame.ToWorldSpace(
          new CFrame(nodePosition as unknown as Vector3)
        );

        const nodeHit = sphereInSphere(
          nodeCframe.Position as unknown as vector,
          (nodeSize.x / 2) * BOX_SPHERE_CONSTANT, //sphere that totally encompasses a that cube
          subtractionPart.Position as unknown as vector,
          subtractionPart.Size.X / 2
        );
        const underLimit = getBinaryLength(node) / 3 <= divisionLimit; //how deep are we in the tree?
        //if we're touching the node, and its possible to divide....
        if (nodeHit && underLimit) {
          const newNodesToCheck = partTree.divide8(node, 1);
          nodesToCheck.remove(math.max(i - 1, 0));
          nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
          // hitNodes.push(node);

          //if we divided the max amount asked, just say this is a node we hit.
        } else if (nodeHit) {
          hitNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
          //if we divided the max amount asked and still didnt hit the node, say its free to go
        } else {
          freeNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
        }
      }
    }
  }

  return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
}
const TOO_SMALL_MAGNITUDE = 4;
//increase the rate that we add to the cache. change depending on the divisions done, but beware: high increases will cause lag.

const displayParts = {} as unknown as { [key: string]: Part[] };
let lastCframe = new CFrame();

//let some parts build up in the partCache
cacheControl.increase = 5;
task.wait(2);
cacheControl.increase = 1;

const octree = new SphereTree(
  vector.create(0, 0, 0),
  SPHERETREE_RADIUS,
  undefined,
  SPHERETREE_MAX_DEPTH,
  SPHERETREE_MAX_ITEMS
);
if (DISPLAY_SPHERETREE) octree._display(new Color3(0.9, 0.64, 0.64));

//add all mapItems to displayPart lsit
for (const part of map.GetChildren()) {
  if (part.IsA('Part')) octree.insertPart(part);
  displayParts[part.Name] = [];
}

RunService.Heartbeat.Connect(function () {
  //query for parts in our general area that may or may not be hitting us
  const nearbyParts = octree.query(
    destroyers.RedBall.Position as unknown as vector,
    destroyers.RedBall.Size.X
  ) as Part[]; //we have no models in the demo, so assume everything is a part.
  const sameCFrame = destroyers.RedBall.CFrame.FuzzyEq(lastCframe); //is the position and rotation of our ball roughly the same as it was last frame?
  //if the pos/rotation changed....
  if (sameCFrame === false) {
    for (const part of nearbyParts) {
      //ignore parts that are really small. They arent worth the effort.
      if (part.Size.Magnitude < TOO_SMALL_MAGNITUDE) continue;

      lastCframe = destroyers.RedBall.CFrame;
      const [freeNodes, hitNodes, partTree] = demolishSphereFast(
        part,
        destroyers.RedBall,
        DEMOLISH_DEPTH
      ); //what nodes did/didnt we hit?
      //Also, its faster to rebuild the octree rather than remove old nodes and reenter them, so we wont save the partTree
      //return old displayParts. could optimize by checking if they should stay, possibly? unsure if that'd be faster
      for (const displayPart of displayParts[part.Name]) {
        partCache.return(displayPart);
        displayParts[part.Name] = [];
      }
      //if the part wasn't hit at all...
      if (hitNodes.size() === 0) {
        part.Transparency = 0;
        //if the part WAS hit
      } else {
        part.Transparency = 1; //hide the real one
        //display only of the non-hit nodes
        for (const node of freeNodes) {
          displayParts[part.Name] = [
            ...displayParts[part.Name],
            ...partTree.display(Enum.PartType.Block, part.Color, node)
          ];
        }
      }
    }
  }
});
