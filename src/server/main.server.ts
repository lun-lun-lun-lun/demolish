//!native
//!optimize 2

import { Workspace } from '@rbxts/services';
import { ReplicatedStorage } from '@rbxts/services';
import { RunService } from '@rbxts/services';

import { makeHello } from 'shared/module';

import LunOctree from 'shared/LunOctree';

// import { Make } from "shared/LooseOctree";
// lol.kill("Hi");
const position = [
  math.random(-50, 50),
  math.random(25, 75),
  math.random(-50, 50)
];
const size = [50, 50, 50];
const maxDepth = 5;
const minSize = 1;
const lenientMinSize = false;
const parentNode = undefined;
const originNode = undefined;
//hiiii
task.wait(5);
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

print(testOctree);
testOctree.divide(5, undefined);
