--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local AutoCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").AutoCache
local boxInSphere = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck").boxInSphere
local sphereInSphere = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck").sphereInSphere
--Types in TS us PascalCase
local EMPTY_VECTOR = vector.create(0, 0, 0)
local EMPTY_CFRAME = CFrame.new(0, 0, 0)
local templatePart = Instance.new("Part")
templatePart.Parent = Workspace
templatePart.Anchored = true
templatePart.CanCollide = false
templatePart.Transparency = 0.5
templatePart.CastShadow = false
templatePart.Shape = Enum.PartType.Block
--typescript is being REALLY annoying about vector and vector3s when they use the exact same type as of april
local function vectorToVector3(vector)
	return Vector3.new(vector.x, vector.y, vector.z)
end
local newVector = vector.create
--octree
local octreeDivisionPositions = table.freeze({ newVector(0, 0, 0), newVector(1, 0, 0), newVector(0, 1, 0), newVector(0, 0, 1), newVector(0, 1, 1), newVector(1, 0, 1), newVector(1, 1, 0), newVector(1, 1, 1) })
--quadtree
local quadtreeDivisionPositions = table.freeze({ newVector(0, 0, 0), newVector(1, 0, 0), newVector(0, 1, 0), newVector(1, 1, 0) })
--dualtree
local dualtreeDivisionPositions = { newVector(1, 0, 0), newVector(0, 0, 0) }
local partCache = AutoCache.new(templatePart, 500, nil)
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
		-- const nodePart = templatePart.Clone();
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
local SpheretreeNode
do
	local super = OctreeNode
	SpheretreeNode = setmetatable({}, {
		__tostring = function()
			return "SpheretreeNode"
		end,
		__index = super,
	})
	SpheretreeNode.__index = SpheretreeNode
	function SpheretreeNode.new(...)
		local self = setmetatable({}, SpheretreeNode)
		return self:constructor(...) or self
	end
	function SpheretreeNode:constructor(cFrame, radius, shape, divisionThreshold, depthLimit, contains, depth)
		if divisionThreshold == nil then
			divisionThreshold = 5
		end
		if depthLimit == nil then
			depthLimit = 5
		end
		--const newVector: vector = vector.create(x, y, z);
		super.constructor(self, cFrame, vector.create(radius, radius, radius))
		self.childNodes = {}
		self.contains = {}
		self.shape = "box"
		self.depth = 0
		self.depthLimit = 3
		self.divisionThreshold = 10
		self.shape = shape
		self.radius = radius
		self.divisionThreshold = divisionThreshold
		self.depthLimit = depthLimit
		if contains ~= nil then
			self.contains = contains
		end
		if depth ~= nil then
			self.depth = depth
		end
	end
	function SpheretreeNode:_update(item, newPosition)
		--
	end
	function SpheretreeNode:_remove(position, item)
	end
	function SpheretreeNode:_insert(position, item)
		local _contains = self.contains
		local _position = position
		local _item = item
		_contains[_position] = _item
		--if too many objects, divide
		-- ▼ ReadonlyMap.size ▼
		local _size = 0
		for _ in self.contains do
			_size += 1
		end
		-- ▲ ReadonlyMap.size ▲
		local _condition = _size > self.divisionThreshold
		if _condition then
			_condition = self.depth + 1 <= self.depthLimit
		end
		if _condition then
			self.childNodes = self:divideOctree()
		end
		--since we approximate all objs into their bounding radiuses, we don't care about the rotation.
		--in the future, when I want to deal with items that have extreme sizes, i'll need to change this. Or not. Idc.
		item:GetPropertyChangedSignal("Position"):Connect(function()
			--
		end)
	end
	function SpheretreeNode:tryInsert(itemLocation, itemSize, itemShape, itemToInsert)
		local touching = false
		local itemPosition
		if itemShape == "box" then
			itemPosition = itemLocation.Position
			touching = boxInSphere(itemLocation, itemSize, self.cFrame.Position, self.radius)
		elseif itemShape == "sphere" then
			itemPosition = itemLocation
			touching = sphereInSphere(itemPosition, itemSize, self.cFrame.Position, self.radius)
		end
		if touching == true then
			self:_insert(itemPosition, itemToInsert)
		end
	end
	function SpheretreeNode:query(hitboxCframe, hitboxSize, hitboxShape)
		for _k, _v in self.contains do
			local item = { _k, _v }
			--collision checker logic
		end
	end
	function SpheretreeNode:divideOctree()
		--these values are defined here so they dont have to be searched for 8 times in the loop
		--is this a microoptimization? perhaps
		-- const childNodes: { [key: string]: OctreeNode } =
		--   {} as unknown as { [key: string]: OctreeNode };
		local cFrame, radius, shape, divisionThreshold, depthLimit, contains, depth = self.cFrame, self.radius, self.shape, self.divisionThreshold, self.depthLimit, self.contains, self.depth + 1
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
			local newNode = SpheretreeNode.new(cFrame, radius / 4, shape, divisionThreshold, depth, {}, depth + 1)
			local newPosition = newCframe.Position
			childNodes[newPosition] = newNode
			--i dont like how this is done, i
			--Check items inside parent and add if inside child too
			for position, item in contains do
				local itemSize = item.Size
				--for now i'll have these as spheres, but if I want to include other shapes i'll probably have to use CFrames as keys or change how my collision detection works
				self:tryInsert(position, math.max(itemSize.X, itemSize.Y, itemSize.Z), "sphere", item)
			end
			--cut because unneeded?
			-- const realCurrentDivision = currentDivision !== undefined ? currentDivision : 1;
			-- if (realCurrentDivision < timesToDivide) {
			--   newNode.divideOctree(1, realCurrentDivision + 1);
			-- }
		end
		return childNodes
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
	SpheretreeNode = SpheretreeNode,
	default = default,
}
