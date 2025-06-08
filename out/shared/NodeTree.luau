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
	function NodeTree:constructor(cFrame, size, depth, maxDepth)
		self.cFrame = EMPTY_CFRAME
		self.size = EMPTY_VECTOR
		self.subNodes = { {} }
		self.depth = 0
		self.maxDepth = 5
		--const newVector: vector = newVector(x, y, z);
		self.cFrame = cFrame
		self.size = size
		if depth ~= nil then
			self.depth = depth
		end
		if maxDepth ~= nil then
			self.maxDepth = maxDepth
		end
	end
	function NodeTree:display(shape)
		local depth = self.depth
		local nodePart = partCache:get()
		-- const nodePart = templatePart.Clone();
		nodePart.Color = Color3.fromRGB(math.clamp(depth * 2, 1, 255), math.clamp(depth * 1, 1, 255), math.clamp(depth * 3, 1, 255))
		nodePart.CFrame = self.cFrame
		nodePart.Size = self.size
		nodePart.Parent = Workspace
		nodePart.Shape = Enum.PartType[shape]
	end
	function NodeTree:divide8()
		local shiftedNode = self.depth * 8
		for i = 1, 8 do
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
