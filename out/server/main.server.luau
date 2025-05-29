--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local LunOctree = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "LunOctree").default
local cacheControl = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").default
local min = 5
local max = 30
local maxDepth = 5
local minSize = 1
local lenientMinSize = false
local parentNode = nil
local originNode = nil
--hiiii
cacheControl.increase = 15
task.wait(5)
cacheControl.increase = 0
--print(testOctree);
local times = {}
local TESTS = 50
for i = 0, TESTS - 1 do
	local position = { math.random(-100, 100), math.random(-15, 50), math.random(-100, 100) }
	local size = { math.random(min, max), math.random(min, max), math.random(min, max) }
	local cFrame = CFrame.new(position[1], position[2], position[3])
	cFrame = cFrame:ToObjectSpace(CFrame.Angles(math.random(1, 10), math.random(1, 10), math.random(1, 10)))
	local startTime = os.clock()
	local testOctree = LunOctree.create(cFrame, vector.create(size[1], size[2], size[3]))
	testOctree:divideOctree(math.random(1, 3))
	local timeee = os.clock() - startTime
	table.insert(times, timeee)
	--print(timeee);
	task.wait(3)
end
local total = 0
for _, time in times do
	total += time
end
cacheControl.increase = 10
--print(testOctree);
