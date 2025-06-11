-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local AutoCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").AutoCache
--shortened func defs
local newVector = vector.create
local dotProduct = vector.dot
--vars
local BOX_SPHERE_CONSTANT = math.sqrt(3)
local O = -1
local octreePositions = table.freeze({ newVector(O, O, O), newVector(O, O, 1), newVector(O, 1, O), newVector(O, 1, 1), newVector(1, O, O), newVector(1, O, 1), newVector(1, 1, O), newVector(1, 1, 1) })
local quadtreePositions = table.freeze({ newVector(O, O, O), newVector(O, 1, O), newVector(1, O, O), newVector(1, 1, O) })
local dualtreePositions = table.freeze({ newVector(O, O, O), newVector(1, O, O) })
local EMPTY_VECTOR = vector.zero
local EMPTY_CFRAME = CFrame.new(0, 0, 0)
local templatePart = Instance.new("Part")
do
	templatePart.Parent = Workspace
	templatePart.Anchored = true
	templatePart.CanCollide = false
	templatePart.Transparency = 0.5
	templatePart.CastShadow = false
	templatePart.Shape = Enum.PartType.Block
end
local partCache = AutoCache.new(templatePart, 500, nil)
--functions
local function squareMagnitude(position)
	return position.x * position.x + position.y * position.y + position.z * position.z
end
-- function GetNodePositionAndSize(BinaryOctree : BinaryOctree,Node : number) : (Vector3,Vector3)
-- 	local NumberLength = math.max(32-bit32.countlz(Node), 0) - 1
-- 	local Position = Vector3.zero
-- 	local HalfSize = BinaryOctree.Size / 4
-- 	HalfSize = Vector3.new(HalfSize,HalfSize,HalfSize)
-- 	for Index = 1,NumberLength,3 do
-- 		local Suffix = bit32.extract(Node,NumberLength - Index - 2,3)
-- 		Position = Position + (HalfSize * SuffixToOrder[Suffix + 1])
-- 		Index += 3
-- 		HalfSize = HalfSize / 2
-- 	end
-- 	return BinaryOctree.OffsetPosition + Position,HalfSize * 2
-- end
--Used purely for the destruction aspect.
local NodeTree
do
	NodeTree = setmetatable({}, {
		__tostring = function()
			return "NodeTree"
		end,
	})
	NodeTree.__index = NodeTree
	function NodeTree.new(...)
		local self = setmetatable({}, NodeTree)
		return self:constructor(...) or self
	end
	function NodeTree:constructor(cFrame, size, children, depth, maxDepth)
		self.cFrame = EMPTY_CFRAME
		self.size = EMPTY_VECTOR
		self.children = { {} }
		self.maxDepth = 5
		--const newVector: vector = newVector(x, y, z);
		self.cFrame = cFrame
		self.size = size
		if children ~= nil then
			self.children = children
		end
		-- if (childNodes !== undefined) {
		--   this.childNodes = childNodes;
		-- }
		-- if (depth !== undefined) {
		--   this.depth = depth;
		-- }
		if maxDepth ~= nil then
			self.maxDepth = maxDepth
		end
	end
	function NodeTree:_getNodePositionAndSize(node)
		--the length of the binary sequence for our node number
		--we subtract one because the for loop will run at least once
		--additionally, NumberLength should always be a multiple of 3, because its only possible for us to get certain nodes, ie those in: 1 U [8,15] U [64,71] etc
		local binaryLength = math.max(32 - bit32.countlz(node), 0) - 1
		local stepX, stepY, stepZ = self.size.x / 4, self.size.y / 4, self.size.z / 4
		local newPosition = { 0, 0, 0 }
		--traverse through the multiple of 3 by 3s
		do
			local i = 1
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 3
				else
					_shouldIncrement = true
				end
				if not (i <= binaryLength) then
					break
				end
				--from the right, extract 3 bits from the binary sequence and convert it to an actual number
				local octreePositionIndex = bit32.extract(node, binaryLength - i - 2, 3) + 1
				local octreePosition = octreePositions[octreePositionIndex + 2]
				local stepAxes = { stepX * octreePosition.x, stepY * octreePosition.y, stepZ * octreePosition.z }
				--we only need to make a vector of this at the end. for now, we use an array, since theyre slightly faster
				newPosition = { newPosition[1] + stepAxes[1], newPosition[2] + stepAxes[2], newPosition[3] + stepAxes[3] }
			end
		end
	end
	function NodeTree:display(shape, node, cframe, size)
		local baseSize = self.size
		local baseSizeX = baseSize.x
		local children = self.children
		local startingNode = 1
		if node ~= nil then
			startingNode = node
		end
		local partCframe = self.cFrame
		if cframe ~= nil then
			partCframe = cframe
		end
		local position = partCframe.Position
		if children[startingNode * 8 + 1] ~= nil then
			local nodeRemainder = startingNode - (startingNode % 8)
			for i = 0, 7 do
				--we'll need to add additional handling for divide2 and divide4 later, this is a start
				--if theres less than 8 siblings, stop and assume the parent node did divide2 or divide4
				-- if (children[startingNode * 8 + i] === undefined) {
				--   break;
				-- }
				-- const newPosition = newVector(position.X);
				print(octreePositions[startingNode % 8 + 1])
				local sizeDivider = math.pow(2, nodeRemainder / 8)
				local baseAxisSize = baseSizeX / sizeDivider
				-- if (startingNode !== 1) {
				--   //startingnode is in [8, inf) (im ignoring the holes after 8 here.)
				--   nodePart.Size = vector.create(
				--     baseAxisSize,
				--     baseAxisSize,
				--     baseAxisSizeeeee
				--   ) as unknown as Vector3;
				-- } else {
				--   nodePart.Size = this.size as unknown as Vector3;
				-- }
				self:display(shape, startingNode * 8 + i, cframe)
			end
		else
			local nodePart = partCache:get()
			nodePart.Color = Color3.fromRGB(math.clamp(startingNode * 1.5, 1, 255), math.clamp(startingNode * 1, 1, 255), math.clamp(startingNode * 2, 1, 255))
			nodePart.CFrame = partCframe
			--will optimize further later by calcing the new size in the previous function and sending it to the children
			--alsoo need to do a less.. silly calc in general
			nodePart.Parent = Workspace
			nodePart.Shape = Enum.PartType[shape]
		end
		--eeeeeee
		-- while #UnvisualisedNodes > 0 do
		--   local Node = table.remove(UnvisualisedNodes)
		--   local NodePosition = GetNodePositionAndSize(BinaryOctree,Node[1])
		--   MakeVisualisePart(Node.Size,NodePosition,Node[1])
		--   for i = 0,7 do
		--     local HashIndex = Node[1] * 8 + i
		--     if BinaryOctree.Nodes[HashIndex] == nil then continue end
		--     table.insert(UnvisualisedNodes,{HashIndex, Size = Node.Size / 2})
		--   end
		-- end
		-- const depth = this.depth;
	end
	function NodeTree:divide8(node)
		-- const depth = this.depth;
		-- const childNodes = this.childNodes;
		local children = self.children
		local shiftedNode = node * 8
		for i = 0, 7 do
			children[shiftedNode + i] = {}
			if shiftedNode + i - 1 > 16 then
				return nil
			end
			self:divide8(shiftedNode + i - 1)
			-- this.subNodes[shiftedNode + i] = [];
		end
	end
end
--const SubdivideThreshold = 1 //replacing with a per-octree solution
-- const SuffixToOrder = table.freeze({
-- 	newVector(-1,-1,-1),
-- 	newVector(-1,-1,1),
-- 	Vector3.new(-1,1,-1), --2
-- 	Vector3.new(-1,1,1),  --3
-- 	Vector3.new(1,-1,-1), --4
-- 	Vector3.new(1,-1,1),  --5
-- 	Vector3.new(1,1,-1),  --6
-- 	Vector3.new(1,1,1),   --7
-- })
return {
	NodeTree = NodeTree,
}
