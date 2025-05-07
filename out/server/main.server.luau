--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local LunOctree = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "LunOctree").default
local cacheControl = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").default
-- import { Make } from "shared/LooseOctree";
-- lol.kill("Hi");
local min = 10
local max = 20
local maxDepth = 5
local minSize = 1
local lenientMinSize = false
local parentNode = nil
local originNode = nil
--hiiii
task.wait(5)
--print(testOctree);
local times = {}
local TESTS = 5
for i = 0, TESTS - 1 do
	local position = { math.random(-50, 50), math.random(-25, 50), math.random(-50, 50) }
	local size = { math.random(min, max), math.random(min, max), math.random(min, max) }
	local angle = CFrame.new(position[1], position[2], position[3])
	angle = angle:ToObjectSpace(CFrame.Angles(math.random(1, 10), math.random(1, 10), math.random(1, 10)))
	local startTime = os.clock()
	local testOctree = LunOctree.create(angle, size[1], size[2], size[3], maxDepth, minSize, lenientMinSize, "box")
	testOctree:divideOctree(testOctree.cFrame.Position, math.random(1, 2), nil)
	local timeee = os.clock() - startTime
	table.insert(times, timeee)
	print(timeee)
	task.wait(1)
end
local total = 0
for _, time in times do
	total += time
end
print(total / #times)
cacheControl.increase = 5
--print(testOctree);
