--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local NodeTree = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "NodeTree").NodeTree
local boxInSphere = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck").boxInSphere
local cacheControl = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").default
local BOX_SPHERE_CONSTANT = math.sqrt(3) / 2
local WORLD_CENTER = vector.create(0, 20, 0)
local SPHERETREE_RADIUS = 100 * BOX_SPHERE_CONSTANT
local map = Workspace:WaitForChild("Map")
local destroyers = Workspace:WaitForChild("Destroyers")
--get the length of the binary sequence for any number
local function getBinaryLength(num)
	return math.max(32 - bit32.countlz(num), 0) - 1
end
local function demolish(part, subtractionSphere, divisionLimit)
	if divisionLimit == nil then
		divisionLimit = 2
	end
	local partCframe = part.CFrame
	local partSize = part.Size
	local spherePosition = subtractionSphere.Position
	local sphereRadius = subtractionSphere.Size.X / 2
	local partTree = NodeTree.new(partCframe, partSize)
	local freeNodes = {}
	local hitNodes = {}
	if boxInSphere(partCframe, partSize, spherePosition, sphereRadius) == true then
		local nodesToCheck = partTree:divide8(1, 1)
		while #nodesToCheck > 0 do
			do
				local i = #nodesToCheck
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						i = i - 1
					else
						_shouldIncrement = true
					end
					if not (i > 0) then
						break
					end
					local node = nodesToCheck[math.max(i - 1, 0) + 1]
					print(i, nodesToCheck, node)
					local _binding = partTree:_getNodeOffsetAndSize(node)
					local nodePosition = _binding[1]
					local nodeSize = _binding[2]
					local nodeCframe = partTree.cFrame:ToWorldSpace(CFrame.new(nodePosition))
					local nodeHit = boxInSphere(nodeCframe, nodeSize, spherePosition, sphereRadius)
					local underLimit = getBinaryLength(node) / 3 <= divisionLimit
					if nodeHit and underLimit then
						local newNodesToCheck = partTree:divide8(node, 1)
						local _nodesToCheck = nodesToCheck
						local _arg0 = math.max(i - 1, 0)
						table.remove(_nodesToCheck, _arg0 + 1)
						local _array = {}
						local _length = #_array
						local _nodesToCheckLength = #nodesToCheck
						table.move(nodesToCheck, 1, _nodesToCheckLength, _length + 1, _array)
						_length += _nodesToCheckLength
						table.move(newNodesToCheck, 1, #newNodesToCheck, _length + 1, _array)
						nodesToCheck = _array
						-- hitNodes.push(node);
					elseif nodeHit then
						table.insert(hitNodes, node)
						local _nodesToCheck = nodesToCheck
						local _arg0 = math.max(i - 1, 0)
						table.remove(_nodesToCheck, _arg0 + 1)
					else
						table.insert(freeNodes, node)
						local _nodesToCheck = nodesToCheck
						local _arg0 = math.max(i - 1, 0)
						table.remove(_nodesToCheck, _arg0 + 1)
					end
					-- print(getBinaryLength(node));
					-- if (nodeHit === true && underLimit === true) {
					--   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
					-- } else if (nodeHit === false) {
					--   freeNodes.push(node);
					--   nodesToCheck.remove(i);
					-- } else if (underLimit === false) {
					--   hitNodes.push(node);
					--   nodesToCheck.remove(i);
					-- }
				end
			end
		end
	end
	return { freeNodes, hitNodes, partTree }
end
cacheControl.increase = 1
map.Block3.Transparency = 1
local idk = 1
while idk == 1 do
	--
	local _binding = demolish(map.Block3, destroyers.RedBall, 2)
	local freeNodes = _binding[1]
	local hitNodes = _binding[2]
	local partTree = _binding[3]
	for _, node in freeNodes do
		partTree:display("Block", node, 0.1)
	end
	task.wait(0.1)
end
-- for (const node of hitNodes) {
--   partTree.display('Block', node);
-- }
-- task.wait(7);
-- cacheControl.increase = 0;
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
-- let total = 0;
-- for (let i = 0; i < 100; i++) {
--   const startTime = os.clock();
--   const randomPosition = new Vector3(
--     math.random(-50, 50),
--     math.random(0, 100),
--     math.random(-50, 50)
--   );
--   const randomRotation = CFrame.Angles(
--     math.rad(math.random(0, 360)), // X axis
--     math.rad(math.random(0, 360)), // Y axis
--     math.rad(math.random(0, 360)) // Z axis
--   );
--   const testTree = new NodeTree(
--     new CFrame(randomPosition).mul(randomRotation),
--     vector.create(math.random(10, 100), math.random(10, 100), math.random(10, 100))
--   );
--   print(testTree.divide8(1, 2));
--   testTree.display('Block');
--   const timeee = os.clock() - startTime;
--   total += timeee;
--   task.wait(0.1);
-- }
-- print(total / 100);
-- //print(testOctree);
