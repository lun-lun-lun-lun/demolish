//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { ReplicatedStorage } from '@rbxts/services';
import { RunService } from '@rbxts/services';

import { makeHello } from 'shared/module';

import LunOctree from 'shared/LunOctree';
import cacheControl from 'shared/AutoCache';

// import { Make } from "shared/LooseOctree";
// lol.kill("Hi");

const min = 10;
const max = 20;

const maxDepth = 5;
const minSize = 1;
const lenientMinSize = false;
const parentNode = undefined;
const originNode = undefined;
//hiiii
cacheControl.increase = 10;
task.wait(5);
cacheControl.increase = 0;
//print(testOctree);
const times = [];
const TESTS = 5;
for (let i = 0; i < TESTS; i++) {
  const position = [
    math.random(-50, 50),
    math.random(-25, 50),
    math.random(-50, 50)
  ];
  const size = [
    math.random(min, max),
    math.random(min, max),
    math.random(min, max)
  ];
  let cFrame = new CFrame(position[0], position[1], position[2]);
  cFrame = cFrame.ToObjectSpace(
    CFrame.Angles(
      math.random(1, 10),
      math.random(1, 10),
      math.random(1, 10)
    )
  );
  const startTime = os.clock();
  const testOctree = LunOctree.create(
    cFrame,
    vector.create(size[0], size[1], size[2])
    // size[0],
    // size[1],
    // size[2],
    // maxDepth,
    // minSize,
    // lenientMinSize
    //'box'
  );
  testOctree.divideOctree(math.random(1, 2));
  const timeee = os.clock() - startTime;
  times.push(timeee);
  //print(timeee);
  task.wait(1);
} //hiiii

let total = 0;
for (const time of times) {
  total += time;
}

cacheControl.increase = 5;
//print(testOctree);
