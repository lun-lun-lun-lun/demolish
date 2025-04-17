--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local emptyVector3 = vector.create(0, 0, 0)
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
	function OctreeNode:constructor(position, size, depth, maxDepth, minSize, lenient, originNode, parentNode)
		self.position = emptyVector3
		self.size = emptyVector3
		self.maxDepth = 5
		self.minSize = 50
		self.lenientMinSize = true
		self.depth = 0
		self.originNode = nil
		self.parentNode = nil
		self.childNodes = {}
		self.detected = {}
		--const newVector: vector = vector.create(x, y, z);
		self.position = position
		self.size = size
		self.maxDepth = maxDepth
		self.minSize = minSize
		self.lenientMinSize = lenient
		self.depth = depth
		self.originNode = if originNode ~= nil then originNode else nil
		self.parentNode = if parentNode ~= nil then parentNode else nil
	end
	function OctreeNode:divide(timesToDivide, currentDivision)
		--these values are defined here so they dont have to be searched for 8 times in the loop
		--is this a microoptimization? perhaps
		local depth = self.depth
		local maxDepth = self.maxDepth
		local minSize = self.minSize
		local lenientMinSize = self.lenientMinSize
		local originNode = self.originNode or self
		local size = self.size
		local sizeX, sizeY, sizeZ = size.x, size.y, size.z
		local stepX, stepY, stepZ = sizeX / 2, sizeY / 2, sizeZ / 2
		local offsetX, offsetY, offsetZ = stepX / 2, stepY / 2, stepZ / 2
		local newSize = vector.create(sizeX / 4, sizeY / 4, sizeZ / 4)
		--create 8 equally sized, equally spaced nodes within the AABB of the Octree
		for y = 0, 1 do
			local newY = stepY * -y + offsetY
			for z = 0, 1 do
				local newZ = stepZ * z + offsetZ
				for x = 0, 1 do
					local newX = stepX * x + offsetX
					local newPosition = vector.create(newX, newY, newZ)
					local newNode = OctreeNode.new(newPosition, newSize, depth + 1, maxDepth, minSize, lenientMinSize, originNode, self)
					local _exp = self.childNodes
					table.insert(_exp, newNode)
					--if we've been tasked with dividing even more...
					if currentDivision ~= nil and timesToDivide ~= nil and currentDivision <= timesToDivide then
						newNode:divide(timesToDivide, currentDivision + 1)
					end
				end
			end
		end
	end
end
local function Create(px, py, pz, sx, sy, sz, maxDepth, minSize, lenientMinSize)
	--do sum
	local position = vector.create(px, py, pz)
	local size = vector.create(sx, sy, sz)
	local newOctree = OctreeNode.new(position, size, 0, maxDepth, minSize, lenientMinSize, nil, nil)
	return newOctree
end
local function Subdivide(timesToSubdivide)
	--do sum
	-- const position: NewVector3 = vector.create(px, py, pz);
	-- const size: NewVector3 = vector.create(sx, sy, sz);
	-- const newOctree = new OctreeNode(position, size, 5, true);
	-- return newOctree;
end
local default = {
	create = Create,
}
--"hi"
return {
	Create = Create,
	Subdivide = Subdivide,
	OctreeNode = OctreeNode,
	default = default,
}
