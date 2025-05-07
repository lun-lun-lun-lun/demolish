--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local AutoCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").AutoCache
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
	function OctreeNode:constructor(cFrame, size, shape)
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
		self.shape = "box"
		--const newVector: vector = vector.create(x, y, z);
		self.cFrame = cFrame
		self.size = size
		self.shape = shape
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
	function OctreeNode:divideOctree(positionReference, timesToDivide, currentDivision)
		--these values are defined here so they dont have to be searched for 8 times in the loop
		--is this a microoptimization? perhaps
		-- const childNodes: { [key: string]: OctreeNode } =
		--   {} as unknown as { [key: string]: OctreeNode };
		local childNodes = {}
		local size = self.size
		local sizeX, sizeY, sizeZ = size.x, size.y, size.z
		local stepX, stepY, stepZ = sizeX / 2, sizeY / 2, sizeZ / 2
		-- const [offsetX, offsetY, offsetZ] = [
		--   -stepX / 2 + positionReference.x,
		--   positionReference.y - stepY / 2,
		--   -stepZ / 2 + positionReference.z
		-- ];
		local offsetX, offsetY, offsetZ = -stepX / 2, -stepY / 2, -stepZ / 2
		local newSize = newVector(stepX, stepY, stepZ)
		--create 8 properly sized, equally spaced nodes within the AABB of the Octree
		for _, stepChange in octreeDivisionPositions do
			local positionOffset = CFrame.new(stepChange.x * stepX + offsetX, stepChange.y * stepY + offsetY, stepChange.z * stepZ + offsetZ)
			local newCframe = self.cFrame:ToWorldSpace(positionOffset)
			local newNode = OctreeNode.new(newCframe, newSize, self.shape)
			--childNodes[tostring(newVector)] = newNode; //`0, 0, 0` = newNode
			local newPosition = newCframe.Position
			childNodes[newPosition] = newNode
			local realCurrentDivision = if currentDivision ~= nil then currentDivision else 1
			if realCurrentDivision < timesToDivide then
				newNode:divideOctree(newPosition, 1, realCurrentDivision + 1)
			end
		end
		return childNodes
	end
	function OctreeNode:query(hitboxShape, hitboxPosition, hitboxRotation, hitboxSize, octreeShape)
		if octreeShape == "sphere" then
			--sphere
		else
			--box
		end
		--spherical octree for querying
		--makes more sense for my weird OBBs
		--Dynamic BVH would also make sense to do for hitbox queries, but nahhhh... too long to make.
		--less computational cost per query that way
		--skip to lowest octree children? No, there'd be too many to calculate, it'd be unnecessary
	end
end
local function Create(cFrame, sx, sy, sz, maxDepth, minSize, lenientMinSize, shape)
	--do sum
	--const position: NewVector3 = vector.create(px, py, pz);
	local size = vector.create(sx, sy, sz)
	local newOctree = OctreeNode.new(cFrame, size, shape)
	return newOctree
end
local default = {
	create = Create,
}
--"hi"
return {
	Create = Create,
	OctreeNode = OctreeNode,
	default = default,
}
