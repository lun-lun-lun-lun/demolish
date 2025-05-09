--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local AutoCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").AutoCache
local boxInBox = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck").boxInBox
--Types in TS us PascalCase
local sphereBoxCheck = function(position, radius, params)
	return Workspace:GetPartBoundsInRadius(position, radius, params)
end
local boxBoxCheck = function(cFrame, size, params)
	return Workspace:GetPartBoundsInBox(cFrame, size, params)
end
local EMPTY_VECTOR = vector.create(0, 0, 0)
local EMPTY_CFRAME = CFrame.new(0, 0, 0)
local DEFAULT_PART = Instance.new("Part")
DEFAULT_PART.Parent = Workspace
DEFAULT_PART.Anchored = true
DEFAULT_PART.CanCollide = false
DEFAULT_PART.Transparency = 0.5
DEFAULT_PART.CastShadow = false
DEFAULT_PART.Shape = Enum.PartType.Block
local newVector = vector.create
--octree
local octreeDivisionPositions = table.freeze({ newVector(0, 0, 0), newVector(1, 0, 0), newVector(0, 1, 0), newVector(0, 0, 1), newVector(0, 1, 1), newVector(1, 0, 1), newVector(1, 1, 0), newVector(1, 1, 1) })
--quadtree
local quadtreeDivisionPositions = table.freeze({ newVector(0, 0, 0), newVector(1, 0, 0), newVector(0, 1, 0), newVector(1, 1, 0) })
--dualtree
local dualtreeDivisionPositions = { newVector(1, 0, 0), newVector(0, 0, 0) }
local partCache = AutoCache.new(DEFAULT_PART, 500, nil)
--since I have to use OOP, i'll use it for this
local OctreeNode
do
	OctreeNode = setmetatable({}, {
		__tostring = function()
			return "OctreeNode"
		end,
	})
	OctreeNode.__index = OctreeNode
	function OctreeNode.new(...)
		local self = setmetatable({}, OctreeNode)
		return self:constructor(...) or self
	end
	function OctreeNode:constructor(cFrame, size)
		--this.shape = shape;
		-- this.maxDepth = maxDepth;
		-- this.minSize = minSize;
		-- this.lenientMinSize = lenient;
		-- this.depth = depth;
		-- this.originNode = originNode;
		-- this.parentNode = parentNode;
		--show a visual representation
		-- this.display('Block');
		self.cFrame = EMPTY_CFRAME
		self.size = EMPTY_VECTOR
		--const newVector: vector = vector.create(x, y, z);
		self.cFrame = cFrame
		self.size = size
		--this.shape = shape;
		-- this.maxDepth = maxDepth;
		-- this.minSize = minSize;
		-- this.lenientMinSize = lenient;
		-- this.depth = depth;
		-- this.originNode = originNode;
		-- this.parentNode = parentNode;
		--show a visual representation
		-- this.display('Block');
	end
	function OctreeNode:display(shape)
		local nodePart = partCache:get()
		-- const nodePart = DEFAULT_PART.Clone();
		nodePart.Color = Color3.fromRGB(math.random(1, 255), math.random(1, 255), math.random(1, 255))
		nodePart.CFrame = self.cFrame
		nodePart.Size = self.size
		nodePart.Parent = Workspace
		nodePart.Shape = Enum.PartType[shape]
	end
	function OctreeNode:divideOctree(timesToDivide, currentDivision)
		--these values are defined here so they dont have to be searched for 8 times in the loop
		--is this a microoptimization? perhaps
		-- const childNodes: { [key: string]: OctreeNode } =
		--   {} as unknown as { [key: string]: OctreeNode };
		local childNodes = {}
		local size = self.size
		local sizeX, sizeY, sizeZ = size.x, size.y, size.z
		local stepX, stepY, stepZ = sizeX / 2, sizeY / 2, sizeZ / 2
		local offsetX, offsetY, offsetZ = -stepX / 2, -stepY / 2, -stepZ / 2
		local newSize = newVector(stepX, stepY, stepZ)
		--create 8 properly sized, equally spaced nodes within the AABB of the Octree
		for _, stepChange in octreeDivisionPositions do
			local positionOffset = CFrame.new(stepChange.x * stepX + offsetX, stepChange.y * stepY + offsetY, stepChange.z * stepZ + offsetZ)
			local newCframe = self.cFrame:ToWorldSpace(positionOffset)
			local newNode = OctreeNode.new(newCframe, newSize)
			local newPosition = newCframe.Position
			childNodes[newPosition] = newNode
			local realCurrentDivision = if currentDivision ~= nil then currentDivision else 1
			if realCurrentDivision < timesToDivide then
				newNode:divideOctree(1, realCurrentDivision + 1)
			end
		end
		return childNodes
	end
end
local ShapetreeNode
do
	local super = OctreeNode
	ShapetreeNode = setmetatable({}, {
		__tostring = function()
			return "ShapetreeNode"
		end,
		__index = super,
	})
	ShapetreeNode.__index = ShapetreeNode
	function ShapetreeNode.new(...)
		local self = setmetatable({}, ShapetreeNode)
		return self:constructor(...) or self
	end
	function ShapetreeNode:constructor(cFrame, size, shape, divisionThreshold, depthLimit, contains, depth)
		if divisionThreshold == nil then
			divisionThreshold = 5
		end
		if depthLimit == nil then
			depthLimit = 5
		end
		--const newVector: vector = vector.create(x, y, z);
		super.constructor(self, cFrame, size)
		--this.shape = shape;
		-- this.maxDepth = maxDepth;
		-- this.minSize = minSize;
		-- this.lenientMinSize = lenient;
		-- this.depth = depth;
		-- this.originNode = originNode;
		-- this.parentNode = parentNode;
		--show a visual representation
		-- this.display('Block');
		self.contains = {}
		self.shape = "sphere"
		self.depth = 0
		self.depthLimit = 3
		self.divisionThreshold = 0
		self.shape = shape
		self.divisionThreshold = divisionThreshold
		self.depthLimit = depthLimit
		if contains ~= nil then
			self.contains = contains
		end
		if depth ~= nil then
			self.depth = depth
		end
		--this.shape = shape;
		-- this.maxDepth = maxDepth;
		-- this.minSize = minSize;
		-- this.lenientMinSize = lenient;
		-- this.depth = depth;
		-- this.originNode = originNode;
		-- this.parentNode = parentNode;
		--show a visual representation
		-- this.display('Block');
	end
	function ShapetreeNode:_insert(position, item)
		local _contains = self.contains
		local _position = position
		local _item = item
		_contains[_position] = _item
		--if too many objects, divide
	end
	function ShapetreeNode:tryInsert(itemCframe, itemSize, itemShape, item)
		local result = false
		if itemShape == "box" then
			if self.shape == "box" then
				result = boxInBox(itemCframe, itemSize, self.cFrame, self.size)
			end
		elseif itemShape == "sphere" then
			print("hi")
		end
	end
	function ShapetreeNode:query(hitboxCframe, hitboxSize, hitboxShape)
		for _k, _v in self.contains do
			local item = { _k, _v }
			--collision checker logic
		end
	end
end
local function Create(cFrame, size)
	--do sum
	--const position: NewVector3 = vector.create(px, py, pz);
	-- const size: NewVector3 = vector.create(sx, sy, sz);
	local newOctree = OctreeNode.new(cFrame, size)
	return newOctree
end
local default = {
	create = Create,
}
--"hi"
return {
	Create = Create,
	OctreeNode = OctreeNode,
	ShapetreeNode = ShapetreeNode,
	default = default,
}
