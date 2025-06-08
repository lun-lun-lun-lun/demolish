--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local RunService = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").RunService
-- import NodeOctree from 'shared/Nodetree';
local BOX_SPHERE_CONSTANT = math.sqrt(3) / 2
local WORLD_CENTER = vector.create(0, 80, 0)
local SPHERETREE_RADIUS = 100 * BOX_SPHERE_CONSTANT
local map = Workspace:WaitForChild("Map")
RunService.Heartbeat:Connect(function(deltaTime)
	-- const binaryTree = NodeOctree.newOctree(500, 5);
	-- NodeOctree.InsertObjects(binaryTree, [
	--   map.Block1,
	--   map.Block2,
	--   map.Block3,
	--   map.Block4,
	--   map.Block5
	-- ]);
	-- // for (const object of [map.Block1, map.Block2, map.Block3, map.Block4, map.Block5]) {
	-- //   NodeOctree.RemoveObject(binaryTree, object);
	-- // }
	-- NodeOctree.VisualizeOctree(binaryTree);
end)
--print(map.Block1);
-- const mapSpheretree = new SpheretreeNode(WORLD_CENTER, SPHERETREE_RADIUS, 1, 5, 3);
--TO DO
--removals and movements
-- for spheretreenodes
--build an example place
--
-- const min = 5;
-- const max = 30;
-- const maxDepth = 5;
-- const minSize = 1;
-- const lenientMinSize = false;
-- const parentNode = undefined;
-- const originNode = undefined;
-- //hiiii
-- cacheControl.increase = 15;
-- task.wait(5);
-- cacheControl.increase = 0;
-- //print(testOctree);
-- const times = [];
-- const TESTS = 50;
-- for (let i = 0; i < TESTS; i++) {
--   const position = [math.random(-100, 100), math.random(-15, 50), math.random(-100, 100)];
--   const size = [math.random(min, max), math.random(min, max), math.random(min, max)];
--   let cFrame = new CFrame(position[0], position[1], position[2]);
--   cFrame = cFrame.ToObjectSpace(
--     CFrame.Angles(math.random(1, 10), math.random(1, 10), math.random(1, 10))
--   );
--   const startTime = os.clock();
--   const testOctree = LunOctree.create(
--     cFrame,
--     vector.create(size[0], size[1], size[2])
--     // size[0],
--     // size[1],
--     // size[2],
--     // maxDepth,
--     // minSize,
--     // lenientMinSize
--     //'box'
--   );
--   testOctree.divideOctree(math.random(1, 3));
--   const timeee = os.clock() - startTime;
--   times.push(timeee);
--   //print(timeee);
--   task.wait(3);
-- } //hiiii
-- let total = 0;
-- for (const time of times) {
--   total += time;
-- }
-- cacheControl.increase = 10;
-- //print(testOctree);
