//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { ReplicatedStorage } from '@rbxts/services';
import { RunService } from '@rbxts/services';

import { makeHello } from 'shared/module';

import LunOctree from 'shared/LunOctree';

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
task.wait(5);

//print(testOctree);
const times = [];
const TESTS = 10;
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
  const startTime = os.clock();
  const testOctree = LunOctree.create(
    new CFrame(0, 0, 0),
    size[0],
    size[1],
    size[2],
    maxDepth,
    minSize,
    lenientMinSize,
    'box'
  );
  testOctree.divideOctree(
    testOctree.cFrame.Position as unknown as vector,
    2,
    undefined
  );
  const timeTaken = os.clock() - startTime;
  print(timeTaken);
  times.push(timeTaken);
  task.wait(1);
} //hiiii

let total = 0;
for (const time of times) {
  total += time;
}
print(total / TESTS);
//print(testOctree);
