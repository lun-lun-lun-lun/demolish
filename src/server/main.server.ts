//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { ReplicatedStorage } from '@rbxts/services';
import { RunService } from '@rbxts/services';

import { makeHello } from 'shared/module';

import LunOctree from 'shared/LunOctree';
import { SpheretreeNode } from 'shared/LunOctree';
import { NodeTree } from 'shared/NodeTree';
import cacheControl from 'shared/AutoCache';

interface MapChildren {
  Block1: Part;
  Block2: Part;
  Block3: Part;
  Block4: Part;
  Block5: Part;
}

const BOX_SPHERE_CONSTANT = math.sqrt(3) / 2; //multiply by the CUBE's x, y or z to make a sphere that perfectly consumes it
const WORLD_CENTER = vector.create(0, 20, 0);
const SPHERETREE_RADIUS = 100 * BOX_SPHERE_CONSTANT;
const map = Workspace.WaitForChild('Map') as Folder & MapChildren;

const testTree = new NodeTree(
  new CFrame(WORLD_CENTER as unknown as Vector3),
  vector.create(50, 50, 50)
);
testTree.divide8(1);
testTree.display('Block');
// RunService.Heartbeat.Connect(function (deltaTime) {
//   // const binaryTree = NodeOctree.newOctree(500, 5);
//   // NodeOctree.InsertObjects(binaryTree, [
//   //   map.Block1,
//   //   map.Block2,
//   //   map.Block3,
//   //   map.Block4,
//   //   map.Block5
//   // ]);
//   // // for (const object of [map.Block1, map.Block2, map.Block3, map.Block4, map.Block5]) {
//   // //   NodeOctree.RemoveObject(binaryTree, object);
//   // // }
//   // NodeOctree.VisualizeOctree(binaryTree);
// });

//print(map.Block1);
// const mapSpheretree = new SpheretreeNode(WORLD_CENTER, SPHERETREE_RADIUS, 1, 5, 3);

//TO DO
//removals and movements
// for spheretreenodes
//build an example place
//

// const min = 5;
// const max = 30;

// const maxDepth = 5;
// const minSize = 1;
// const lenientMinSize = false;
// const parentNode = undefined;
// const originNode = undefined;
// //hiiii
// cacheControl.increase = 15;
// task.wait(5);
// cacheControl.increase = 0;
// //print(testOctree);
// const times = [];
// const TESTS = 50;
// for (let i = 0; i < TESTS; i++) {
//   const position = [math.random(-100, 100), math.random(-15, 50), math.random(-100, 100)];
//   const size = [math.random(min, max), math.random(min, max), math.random(min, max)];
//   let cFrame = new CFrame(position[0], position[1], position[2]);
//   cFrame = cFrame.ToObjectSpace(
//     CFrame.Angles(math.random(1, 10), math.random(1, 10), math.random(1, 10))
//   );
//   const startTime = os.clock();
//   const testOctree = LunOctree.create(
//     cFrame,
//     vector.create(size[0], size[1], size[2])
//     // size[0],
//     // size[1],
//     // size[2],
//     // maxDepth,
//     // minSize,
//     // lenientMinSize
//     //'box'
//   );
//   testOctree.divideOctree(math.random(1, 3));
//   const timeee = os.clock() - startTime;
//   times.push(timeee);
//   //print(timeee);
//   task.wait(3);
// } //hiiii

// let total = 0;
// for (const time of times) {
//   total += time;
// }

// cacheControl.increase = 10;
// //print(testOctree);
