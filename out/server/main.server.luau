-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local makeHello = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "module").makeHello
-- import { Make } from "shared/LooseOctree";
-- lol.kill("Hi");
print(makeHello("main.server.ts"))
