//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { ReplicatedStorage } from '@rbxts/services';
import { RunService } from '@rbxts/services';

import { makeHello } from 'shared/module';

import LunOctree from 'shared/LunOctree';

// import { Make } from "shared/LooseOctree";
// lol.kill("Hi");

const min = 1;
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
for (let i = 0; i < 300; i++) {
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
    position[0],
    position[1],
    position[2],
    size[0],
    size[1],
    size[2],
    maxDepth,
    minSize,
    lenientMinSize
  );
  testOctree.divideOctree(testOctree.position, 2, undefined);
  const timeTaken = os.clock() - startTime;
  print(timeTaken);
  times.push(timeTaken);
  task.wait();
} //hiiii

let total = 0;
for (const time of times) {
  total += time;
}
print(total / 100);
//print(testOctree);
