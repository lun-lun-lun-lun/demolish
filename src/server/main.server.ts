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

cacheControl.increase = 5;
task.wait(7);
cacheControl.increase = 0;
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

let total = 0;
for (let i = 0; i < 100; i++) {
  const startTime = os.clock();
  const randomPosition = new Vector3(
    math.random(-50, 50),
    math.random(0, 100),
    math.random(-50, 50)
  );
  const randomRotation = CFrame.Angles(
    math.rad(math.random(0, 360)), // X axis
    math.rad(math.random(0, 360)), // Y axis
    math.rad(math.random(0, 360)) // Z axis
  );

  const testTree = new NodeTree(
    new CFrame(randomPosition).mul(randomRotation),
    vector.create(math.random(10, 100), math.random(10, 100), math.random(10, 100))
  );
  testTree.divide8(1);
  testTree.display('Block');
  const timeee = os.clock() - startTime;
  print(timeee);
  total += timeee;
  task.wait(0.1);
}
print(total / 100);

// //print(testOctree);
