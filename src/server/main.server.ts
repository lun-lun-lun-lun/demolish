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
// import { pointInBox } from 'CollisionCheck';
import { boxInBox } from 'shared/CollisionCheck';
import { sphereInSphere } from 'shared/CollisionCheck';
import { boxInSphere } from 'shared/CollisionCheck';
import JackSpawn from 'shared/JackSpawn';
// CollisionCheck.
import cacheControl from 'shared/AutoCache';
// import { CollisionCheck } from 'CollisionCheck';

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

const BOX_SPHERE_CONSTANT = math.sqrt(3); //multiply by the CUBE's x, y or z to make a sphere that perfectly consumes it
const WORLD_CENTER = vector.create(0, 20, 0);
const SPHERETREE_RADIUS = 100 * BOX_SPHERE_CONSTANT;
const map = Workspace.WaitForChild('Map') as Folder & MapChildren;
const destroyers = Workspace.WaitForChild('Destroyers') as Folder & DestroyersChildren;

//get the length of the binary sequence for any number
function getBinaryLength(num: number) {
  return math.max(32 - bit32.countlz(num), 0) - 1;
}

function demolishBox(part: Part, subtractionPart: Part, divisionLimit?: number) {
  if (divisionLimit === undefined) divisionLimit = 2;
  const partCframe = part.CFrame;
  const partSize = part.Size as unknown as vector;
  // const spherePosition = subtractionSphere.Position as unknown as vector;
  // const sphereRadius = subtractionSphere.Size.X / 2;
  const partTree = new NodeTree(partCframe, partSize);
  const freeNodes: number[] = [];
  const hitNodes: number[] = [];
  if (
    boxInBox(
      partCframe,
      partSize,
      subtractionPart.CFrame,
      subtractionPart.Size as unknown as vector
    )
  ) {
    let nodesToCheck = partTree.divide8(1, 1);
    while (nodesToCheck.size() > 0) {
      for (let i = nodesToCheck.size(); i > 0; i = i - 1) {
        const node = nodesToCheck[math.max(i - 1, 0)];
        const [nodePosition, nodeSize] = partTree._getNodeOffsetAndSize(node);
        const nodeCframe = partTree.cFrame.ToWorldSpace(
          new CFrame(nodePosition as unknown as Vector3)
        );
        const nodeHit = boxInBox(
          nodeCframe,
          nodeSize,
          subtractionPart.CFrame,
          subtractionPart.Size as unknown as vector
        );
        const underLimit = getBinaryLength(node) / 3 <= divisionLimit;
        if (nodeHit && underLimit) {
          const newNodesToCheck = partTree.divide8(node, 1);
          nodesToCheck.remove(math.max(i - 1, 0));
          nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
          // hitNodes.push(node);
        } else if (nodeHit) {
          hitNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
        } else {
          freeNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
        }

        // print(getBinaryLength(node));

        // if (nodeHit === true && underLimit === true) {
        //   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
        // } else if (nodeHit === false) {
        //   freeNodes.push(node);
        //   nodesToCheck.remove(i);
        // } else if (underLimit === false) {
        //   hitNodes.push(node);
        //   nodesToCheck.remove(i);
        // }
      }
    }
  }

  return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
}

function demolishSphere(part: Part, subtractionPart: Part, divisionLimit?: number) {
  if (divisionLimit === undefined) divisionLimit = 2;
  const partCframe = part.CFrame;
  const partSize = part.Size as unknown as vector;
  // const spherePosition = subtractionSphere.Position as unknown as vector;
  // const sphereRadius = subtractionSphere.Size.X / 2;
  const partTree = new NodeTree(partCframe, partSize);
  const freeNodes: number[] = [];
  const hitNodes: number[] = [];
  if (
    boxInSphere(
      partCframe,
      partSize,
      subtractionPart.Position as unknown as vector,
      subtractionPart.Size.X / 2
    )
  ) {
    let nodesToCheck = partTree.divide8(1, 1);
    while (nodesToCheck.size() > 0) {
      for (let i = nodesToCheck.size(); i > 0; i = i - 1) {
        const node = nodesToCheck[math.max(i - 1, 0)];
        const [nodePosition, nodeSize] = partTree._getNodeOffsetAndSize(node);
        const nodeCframe = partTree.cFrame.ToWorldSpace(
          new CFrame(nodePosition as unknown as Vector3)
        );
        const nodeHit = boxInSphere(
          nodeCframe,
          nodeSize,
          subtractionPart.Position as unknown as vector,
          subtractionPart.Size.X / 2
        );
        const underLimit = getBinaryLength(node) / 3 <= divisionLimit;
        if (nodeHit && underLimit) {
          const newNodesToCheck = partTree.divide8(node, 1);
          nodesToCheck.remove(math.max(i - 1, 0));
          nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
          // hitNodes.push(node);
        } else if (nodeHit) {
          hitNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
        } else {
          freeNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
        }

        // print(getBinaryLength(node));

        // if (nodeHit === true && underLimit === true) {
        //   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
        // } else if (nodeHit === false) {
        //   freeNodes.push(node);
        //   nodesToCheck.remove(i);
        // } else if (underLimit === false) {
        //   hitNodes.push(node);
        //   nodesToCheck.remove(i);
        // }
      }
    }
  }

  return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
}

function demolishSphereSuper(part: Part, subtractionPart: Part, divisionLimit?: number) {
  if (divisionLimit === undefined) divisionLimit = 2;
  const partCframe = part.CFrame;
  const partSize = part.Size as unknown as vector;
  // const spherePosition = subtractionSphere.Position as unknown as vector;
  // const sphereRadius = subtractionSphere.Size.X / 2;
  const partTree = new NodeTree(partCframe, partSize);
  const freeNodes: number[] = [];
  const hitNodes: number[] = [];
  if (
    sphereInSphere(
      part.Position as unknown as vector,
      (part.Size.X / 2) * BOX_SPHERE_CONSTANT,
      subtractionPart.Position as unknown as vector,
      subtractionPart.Size.X / 2
    )
  ) {
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
          (nodeSize.x / 2) * BOX_SPHERE_CONSTANT,
          subtractionPart.Position as unknown as vector,
          subtractionPart.Size.X / 2
        );
        const underLimit = getBinaryLength(node) / 3 <= divisionLimit;
        if (nodeHit && underLimit) {
          const newNodesToCheck = partTree.divide8(node, 1);
          nodesToCheck.remove(math.max(i - 1, 0));
          nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
          // hitNodes.push(node);
        } else if (nodeHit) {
          hitNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
        } else {
          freeNodes.push(node);
          nodesToCheck.remove(math.max(i - 1, 0));
        }

        // print(getBinaryLength(node));

        // if (nodeHit === true && underLimit === true) {
        //   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
        // } else if (nodeHit === false) {
        //   freeNodes.push(node);
        //   nodesToCheck.remove(i);
        // } else if (underLimit === false) {
        //   hitNodes.push(node);
        //   nodesToCheck.remove(i);
        // }
      }
    }
  }

  return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
}

cacheControl.increase = 2;
map.Block3.Transparency = 1;
let displayParts = [] as unknown as Part[];
let lastCframe = new CFrame();
// let currentTree: NodeTree = undefined as unknown as NodeTree;
task.wait(1);
const octree = new SphereTree(vector.create(0, 0, 0), 200, undefined, 5, 1);
for (const part of map.GetChildren()) {
  if (part.IsA('Part')) octree.insertPart(part);
}
octree._display(new Color3(100, 100, 100));
RunService.Heartbeat.Connect(function () {
  //
  const idk = octree.query(
    destroyers.RedBall.Position as unknown as vector,
    destroyers.RedBall.Size.X / 2
  );
  // print(octree.query(destroyers.RedBall.Position as unknown as vector, 400));
  const sameCFrame = destroyers.RedBall.CFrame.FuzzyEq(lastCframe);
  if (sameCFrame === false) {
    lastCframe = destroyers.RedBall.CFrame;
    const [freeNodes, hitNodes, partTree] = demolishSphereSuper(
      map.Block3,
      destroyers.RedBall,
      3
    );
    //no nodes hit
    for (const dPart of displayParts) {
      partCache.return(dPart);
      displayParts = [];
    }
    if (hitNodes.size() === 0) {
      map.Block3.Transparency = 0;
    } else {
      map.Block3.Transparency = 1;
      for (const node of freeNodes) {
        displayParts = [
          ...displayParts,
          ...partTree.display(Enum.PartType.Block, map.Block3.Color, node, undefined)
        ];
      }
    }
  }
});
// for (const node of hitNodes) {
//   partTree.display('Block', node);
// }

// task.wait(7);
// cacheControl.increase = 0;

// const testTree = new NodeTree(
//   new CFrame(
//     vector.create(
//       math.random(-100, 100),
//       math.random(-100, 100),
//       math.random(-100, 100)
//     ) as unknown as Vector3
//   ),
//   vector.create(math.random(1, 100), math.random(1, 100), math.random(1, 100))
// );
// testTree.divide8(1);
// testTree.display('Block');

// let total = 0;
// for (let i = 0; i < 100; i++) {
//   const startTime = os.clock();
//   const randomPosition = new Vector3(
//     math.random(-50, 50),
//     math.random(0, 100),
//     math.random(-50, 50)
//   );
//   const randomRotation = CFrame.Angles(
//     math.rad(math.random(0, 360)), // X axis
//     math.rad(math.random(0, 360)), // Y axis
//     math.rad(math.random(0, 360)) // Z axis
//   );

//   const testTree = new NodeTree(
//     new CFrame(randomPosition).mul(randomRotation),
//     vector.create(math.random(10, 100), math.random(10, 100), math.random(10, 100))
//   );
//   print(testTree.divide8(1, 2));
//   testTree.display('Block');
//   const timeee = os.clock() - startTime;
//   total += timeee;
//   task.wait(0.1);
// }
// print(total / 100);

// //print(testOctree);
