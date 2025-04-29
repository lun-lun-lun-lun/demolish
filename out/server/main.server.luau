--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local LunOctree = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "LunOctree").default
-- import { Make } from "shared/LooseOctree";
-- lol.kill("Hi");
local position = { math.random(-50, 50), math.random(-25, 50), math.random(-50, 50) }
local min = 1
local max = 20
local size = { math.random(min, max), math.random(min, max), math.random(min, max) }
local maxDepth = 5
local minSize = 1
local lenientMinSize = false
local parentNode = nil
local originNode = nil
--hiiii
task.wait(5)
local testOctree = LunOctree.create(position[1], position[2], position[3], size[1], size[2], size[3], maxDepth, minSize, lenientMinSize)
--print(testOctree);
testOctree:divideOctree(5, nil)
--print(testOctree);
