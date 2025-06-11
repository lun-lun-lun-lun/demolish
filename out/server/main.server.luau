--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local NodeTree = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "NodeTree").NodeTree
local cacheControl = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").default
local BOX_SPHERE_CONSTANT = math.sqrt(3) / 2
local WORLD_CENTER = vector.create(0, 20, 0)
local SPHERETREE_RADIUS = 100 * BOX_SPHERE_CONSTANT
local map = Workspace:WaitForChild("Map")
cacheControl.increase = 5
task.wait(7)
cacheControl.increase = 0
-- const testTree = new NodeTree(
--   new CFrame(
--     vector.create(
--       math.random(-100, 100),
--       math.random(-100, 100),
--       math.random(-100, 100)
--     ) as unknown as Vector3
--   ),
--   vector.create(math.random(1, 100), math.random(1, 100), math.random(1, 100))
-- );
-- testTree.divide8(1);
-- testTree.display('Block');
local total = 0
for i = 0, 99 do
	local startTime = os.clock()
	local randomPosition = Vector3.new(math.random(-50, 50), math.random(0, 100), math.random(-50, 50))
	local randomRotation = CFrame.Angles(math.rad(math.random(0, 360)), math.rad(math.random(0, 360)), math.rad(math.random(0, 360)))
	local testTree = NodeTree.new(CFrame.new(randomPosition) * randomRotation, vector.create(math.random(10, 100), math.random(10, 100), math.random(10, 100)))
	testTree:divide8(1)
	testTree:display("Block")
	local timeee = os.clock() - startTime
	print(timeee)
	total += timeee
	task.wait(0.1)
end
print(total / 100)
-- //print(testOctree);
