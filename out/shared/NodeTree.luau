-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local AutoCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").AutoCache
--shortened func defs
local newVector = vector.create
local dotProduct = vector.dot
--vars
local BOX_SPHERE_CONSTANT = math.sqrt(3) / 2
local octreePositions = table.freeze({ newVector(0, 0, 0), newVector(1, 0, 0), newVector(0, 1, 0), newVector(0, 0, 1), newVector(0, 1, 1), newVector(1, 0, 1), newVector(1, 1, 0), newVector(1, 1, 1) })
local quadtreePositions = table.freeze({ newVector(0, 0, 0), newVector(1, 0, 0), newVector(0, 1, 0), newVector(1, 1, 0) })
local dualtreePositions = table.freeze({ newVector(1, 0, 0), newVector(0, 0, 0) })
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
	function NodeTree:display(shape, node, cframe)
		local baseSize = self.size
		local children = self.children
		local startingNode = 1
		if node ~= nil then
			startingNode = node
		end
		local partCframe = self.cFrame
		if cframe ~= nil then
			partCframe = cframe
		end
		if children[startingNode * 8 + 1] ~= nil then
			for i = 0, 7 do
				--we'll need to add additional handling for divide2 and divide4 later, this is a start
				--if theres less than 8 siblings, stop and assume the parent node did divide2 or divide4
				-- if (children[startingNode * 8 + i] === undefined) {
				--   break;
				-- }
				self:display(shape, startingNode * 8 + i, cframe)
			end
		else
			local nodePart = partCache:get()
			nodePart.Color = Color3.fromRGB(math.clamp(startingNode * 1.5, 1, 255), math.clamp(startingNode * 1, 1, 255), math.clamp(startingNode * 2, 1, 255))
			nodePart.CFrame = self.cFrame
			nodePart.Size = self.size
			nodePart.Parent = Workspace
			nodePart.Shape = Enum.PartType[shape]
			print(children, startingNode)
		end
		--
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
			children[shiftedNode + i + 1] = {}
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
