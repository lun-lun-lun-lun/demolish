--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local AutoCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").AutoCache
local sphereInSphere = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck").sphereInSphere
--Types in TS us PascalCase
local EMPTY_VECTOR = vector.zero
local EMPTY_CFRAME = CFrame.new(0, 0, 0)
local templatePart = Instance.new("Part")
local BOX_SPHERE_CONSTANT = math.sqrt(3) / 2
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
--I gave these simple functions names because I know I'll forget how later
local function getBoundingSpherePart(part)
	return part.Size.Magnitude
end
local function getBoundingSphereModel(model)
	local modelCframe, modelSize = model:GetBoundingBox()
	return modelSize.Magnitude / 2
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
	function SpheretreeNode:constructor(position, radius, depth, maxDepth, divisionThreshold)
		super.constructor(self, CFrame.new(position.x, position.y, position.z), vector.create(radius, radius, radius))
		self.position = EMPTY_VECTOR
		self.radius = 0
		self.childTrees = {}
		self.childItems = {}
		self.depth = 0
		self.maxDepth = 3
		self.divisionThreshold = 3
		self.position = position
		self.radius = radius
		self.depth = depth
		if maxDepth ~= nil then
			self.maxDepth = maxDepth
		end
		if divisionThreshold ~= nil then
			self.divisionThreshold = divisionThreshold
		end
	end
	function SpheretreeNode:checkInsert(potentialHits)
		local threshold = self.divisionThreshold
		local depth = self.depth
		local maxDepth = self.maxDepth
		local childItems = self.childItems
		local position = self.position
		local insertions = 0
		for _, item in potentialHits do
			local itemRadius
			local itemPosition
			if item:IsA("Part") then
				itemRadius = getBoundingSpherePart(item)
				itemPosition = item.Position
			else
				itemRadius = getBoundingSphereModel(item)
				itemPosition = item:GetPivot().Position
			end
			if sphereInSphere(itemPosition, itemRadius, self.position, self.radius) == true then
				--i put the size in the [] so I don't have to re-calc the size of it each time
				--i'll make another thing for updating size and position later
				local _itemPosition = itemPosition
				local _arg1 = { item, itemRadius }
				childItems[_itemPosition] = _arg1
				insertions += 1
			end
			if insertions >= threshold and depth + 1 <= maxDepth then
				--split and redistribute
				local childNodes = self:divideOctree(1)
				for itemPosition, _binding in childItems do
					local item = _binding[1]
					local itemRadius = _binding[2]
					--
					--get distance from positions as a vector
					--check if the bottom part of the item's bounding sphere is definitely above/below/away from other spheres using that lines x, y, and z
				end
			end
		end
	end
	function SpheretreeNode:divideOctree(timesToDivide, currentDivision)
		--these values are defined here so they dont have to be searched for 8 times in the loop
		--is this a microoptimization? perhaps
		-- const childNodes: { [key: string]: OctreeNode } =
		--   {} as unknown as { [key: string]: OctreeNode };
		local childNodes = {}
		local radius = self.radius
		local step = radius / 2
		local offset = -step / 2
		local childRadius = step
		local stepOffset = step + offset
		local position = self.position
		local positionX, positionY, positionZ = position.x, position.y, position.z
		local depth = self.depth
		local maxDepth = self.maxDepth
		local divisionThreshold = self.divisionThreshold
		--create 8 properly sized, equally spaced nodes within the AABB of the Octree
		for _, stepChange in octreeDivisionPositions do
			local childPosition = vector.create(positionX + stepChange.x * stepOffset, positionY + stepChange.y * stepOffset, positionZ + stepChange.z * stepOffset)
			local newNode = SpheretreeNode.new(childPosition, childRadius, depth + 1, maxDepth, divisionThreshold)
			childNodes[childPosition] = newNode
			local realCurrentDivision = if currentDivision ~= nil then currentDivision else 1
			if realCurrentDivision < timesToDivide then
				newNode:divideOctree(1, realCurrentDivision + 1)
			end
		end
		return childNodes
	end
end
local function Create(cFrame, size)
	print("octree born")
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
