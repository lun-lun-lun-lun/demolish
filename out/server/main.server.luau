--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local RunService = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").RunService
-- import LunOctree from 'shared/LunOctree';
-- import { SpheretreeNode } from 'shared/LunOctree';
local NodeTree = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "NodeTree").NodeTree
local SphereTree = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "NodeTree").SphereTree
local partCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "NodeTree").partCache
local sphereInSphere = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck").sphereInSphere
local cacheControl = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").default
local DISPLAY_SPHERETREE = false
local BOX_SPHERE_CONSTANT = math.sqrt(3)
local WORLD_CENTER = vector.create(0, 20, 0)
local SPHERETREE_RADIUS = 200
local SPHERETREE_MAX_DEPTH = 5
local SPHERETREE_MAX_ITEMS = 1
local DEMOLISH_DEPTH = 2
local map = Workspace:WaitForChild("Map")
local destroyers = Workspace:WaitForChild("Destroyers")
--get the length of the binary sequence for any number
local function getBinaryLength(num)
	return math.max(32 - bit32.countlz(num), 0) - 1
end
-- function demolishBox(part: Part, subtractionPart: Part, divisionLimit?: number) {
--   if (divisionLimit === undefined) divisionLimit = 2;
--   const partCframe = part.CFrame;
--   const partSize = part.Size as unknown as vector;
--   // const spherePosition = subtractionSphere.Position as unknown as vector;
--   // const sphereRadius = subtractionSphere.Size.X / 2;
--   const partTree = new NodeTree(partCframe, partSize);
--   const freeNodes: number[] = [];
--   const hitNodes: number[] = [];
--   if (
--     boxInBox(
--       partCframe,
--       partSize,
--       subtractionPart.CFrame,
--       subtractionPart.Size as unknown as vector
--     )
--   ) {
--     let nodesToCheck = partTree.divide8(1, 1);
--     while (nodesToCheck.size() > 0) {
--       for (let i = nodesToCheck.size(); i > 0; i = i - 1) {
--         const node = nodesToCheck[math.max(i - 1, 0)];
--         const [nodePosition, nodeSize] = partTree._getNodeOffsetAndSize(node);
--         const nodeCframe = partTree.cFrame.ToWorldSpace(
--           new CFrame(nodePosition as unknown as Vector3)
--         );
--         const nodeHit = boxInBox(
--           nodeCframe,
--           nodeSize,
--           subtractionPart.CFrame,
--           subtractionPart.Size as unknown as vector
--         );
--         const underLimit = getBinaryLength(node) / 3 <= divisionLimit;
--         if (nodeHit && underLimit) {
--           const newNodesToCheck = partTree.divide8(node, 1);
--           nodesToCheck.remove(math.max(i - 1, 0));
--           nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
--           // hitNodes.push(node);
--         } else if (nodeHit) {
--           hitNodes.push(node);
--           nodesToCheck.remove(math.max(i - 1, 0));
--         } else {
--           freeNodes.push(node);
--           nodesToCheck.remove(math.max(i - 1, 0));
--         }
--         // print(getBinaryLength(node));
--         // if (nodeHit === true && underLimit === true) {
--         //   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
--         // } else if (nodeHit === false) {
--         //   freeNodes.push(node);
--         //   nodesToCheck.remove(i);
--         // } else if (underLimit === false) {
--         //   hitNodes.push(node);
--         //   nodesToCheck.remove(i);
--         // }
--       }
--     }
--   }
--   return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
-- }
-- function demolishSphere(part: Part, subtractionPart: Part, divisionLimit?: number) {
--   if (divisionLimit === undefined) divisionLimit = 2;
--   const partCframe = part.CFrame;
--   const partSize = part.Size as unknown as vector;
--   // const spherePosition = subtractionSphere.Position as unknown as vector;
--   // const sphereRadius = subtractionSphere.Size.X / 2;
--   const partTree = new NodeTree(partCframe, partSize);
--   const freeNodes: number[] = [];
--   const hitNodes: number[] = [];
--   if (
--     boxInSphere(
--       partCframe,
--       partSize,
--       subtractionPart.Position as unknown as vector,
--       subtractionPart.Size.X / 2
--     )
--   ) {
--     let nodesToCheck = partTree.divide8(1, 1);
--     while (nodesToCheck.size() > 0) {
--       for (let i = nodesToCheck.size(); i > 0; i = i - 1) {
--         const node = nodesToCheck[math.max(i - 1, 0)];
--         const [nodePosition, nodeSize] = partTree._getNodeOffsetAndSize(node);
--         const nodeCframe = partTree.cFrame.ToWorldSpace(
--           new CFrame(nodePosition as unknown as Vector3)
--         );
--         const nodeHit = boxInSphere(
--           nodeCframe,
--           nodeSize,
--           subtractionPart.Position as unknown as vector,
--           subtractionPart.Size.X / 2
--         );
--         const underLimit = getBinaryLength(node) / 3 <= divisionLimit;
--         if (nodeHit && underLimit) {
--           const newNodesToCheck = partTree.divide8(node, 1);
--           nodesToCheck.remove(math.max(i - 1, 0));
--           nodesToCheck = [...nodesToCheck, ...newNodesToCheck];
--           // hitNodes.push(node);
--         } else if (nodeHit) {
--           hitNodes.push(node);
--           nodesToCheck.remove(math.max(i - 1, 0));
--         } else {
--           freeNodes.push(node);
--           nodesToCheck.remove(math.max(i - 1, 0));
--         }
--         // print(getBinaryLength(node));
--         // if (nodeHit === true && underLimit === true) {
--         //   // nodesToCheck = [...nodesToCheck, ...partTree.divide8(node, 1)];
--         // } else if (nodeHit === false) {
--         //   freeNodes.push(node);
--         //   nodesToCheck.remove(i);
--         // } else if (underLimit === false) {
--         //   hitNodes.push(node);
--         //   nodesToCheck.remove(i);
--         // }
--       }
--     }
--   }
--   return [freeNodes, hitNodes, partTree] as [number[], number[], NodeTree];
-- }
--demolish a sphere, but approximate nodes into spheres instead of treating them as cubes. Slightly faster since no OBBs are involved.
local function demolishSphereFast(part, subtractionPart, divisionLimit)
	if divisionLimit == nil then
		divisionLimit = 2
	end
	local partCframe = part.CFrame
	local partSize = part.Size
	local partTree = NodeTree.new(partCframe, partSize)
	local freeNodes = {}
	local hitNodes = {}
	--if we're touching....
	if sphereInSphere(part.Position, (part.Size.X / 2) * BOX_SPHERE_CONSTANT, subtractionPart.Position, subtractionPart.Size.X / 2) then
		--check octants of part
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
					local _binding = partTree:_getNodeOffsetAndSize(node)
					local nodePosition = _binding[1]
					local nodeSize = _binding[2]
					local nodeCframe = partTree.cFrame:ToWorldSpace(CFrame.new(nodePosition))
					local nodeHit = sphereInSphere(nodeCframe.Position, (nodeSize.x / 2) * BOX_SPHERE_CONSTANT, subtractionPart.Position, subtractionPart.Size.X / 2)
					local underLimit = getBinaryLength(node) / 3 <= divisionLimit
					--if we're touching the node, and its possible to divide....
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
						--if we divided the max amount asked, just say this is a node we hit.
					elseif nodeHit then
						table.insert(hitNodes, node)
						local _nodesToCheck = nodesToCheck
						local _arg0 = math.max(i - 1, 0)
						table.remove(_nodesToCheck, _arg0 + 1)
						--if we divided the max amount asked and still didnt hit the node, say its free to go
					else
						table.insert(freeNodes, node)
						local _nodesToCheck = nodesToCheck
						local _arg0 = math.max(i - 1, 0)
						table.remove(_nodesToCheck, _arg0 + 1)
					end
				end
			end
		end
	end
	return { freeNodes, hitNodes, partTree }
end
local TOO_SMALL_MAGNITUDE = 4
--increase the rate that we add to the cache. change depending on the divisions done, but beware: high increases will cause lag.
local displayParts = {}
local lastCframe = CFrame.new()
--let some parts build up in the partCache
cacheControl.increase = 5
task.wait(2)
cacheControl.increase = 1
local octree = SphereTree.new(vector.create(0, 0, 0), SPHERETREE_RADIUS, nil, SPHERETREE_MAX_DEPTH, SPHERETREE_MAX_ITEMS)
if DISPLAY_SPHERETREE then
	octree:_display(Color3.new(0.9, 0.64, 0.64))
end
--add all mapItems to displayPart lsit
for _, part in map:GetChildren() do
	if part:IsA("Part") then
		octree:insertPart(part)
	end
	displayParts[part.Name] = {}
end
RunService.Heartbeat:Connect(function()
	--query for parts in our general area that may or may not be hitting us
	local nearbyParts = octree:query(destroyers.RedBall.Position, destroyers.RedBall.Size.X)
	local sameCFrame = destroyers.RedBall.CFrame:FuzzyEq(lastCframe)
	--if the pos/rotation changed....
	if sameCFrame == false then
		for _, part in nearbyParts do
			--ignore parts that are really small. They arent worth the effort.
			if part.Size.Magnitude < TOO_SMALL_MAGNITUDE then
				continue
			end
			lastCframe = destroyers.RedBall.CFrame
			local _binding = demolishSphereFast(part, destroyers.RedBall, DEMOLISH_DEPTH)
			local freeNodes = _binding[1]
			local hitNodes = _binding[2]
			local partTree = _binding[3]
			--Also, its faster to rebuild the octree rather than remove old nodes and reenter them, so we wont save the partTree
			--return old displayParts. could optimize by checking if they should stay, possibly? unsure if that'd be faster
			for _1, displayPart in displayParts[part.Name] do
				partCache["return"](partCache, displayPart)
				displayParts[part.Name] = {}
			end
			--if the part wasn't hit at all...
			if #hitNodes == 0 then
				part.Transparency = 0
				--if the part WAS hit
			else
				part.Transparency = 1
				--display only of the non-hit nodes
				for _1, node in freeNodes do
					local _array = {}
					local _length = #_array
					local _array_1 = displayParts[part.Name]
					local _Length = #_array_1
					table.move(_array_1, 1, _Length, _length + 1, _array)
					_length += _Length
					local _array_2 = partTree:display(Enum.PartType.Block, part.Color, node)
					table.move(_array_2, 1, #_array_2, _length + 1, _array)
					displayParts[part.Name] = _array
				end
			end
		end
	end
end)
