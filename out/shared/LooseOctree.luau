--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local emptyVector3 = vector.create(0, 0, 0)
local LooseOctree
do
	LooseOctree = setmetatable({}, {
		__tostring = function()
			return "LooseOctree"
		end,
	})
	LooseOctree.__index = LooseOctree
	function LooseOctree.new(...)
		local self = setmetatable({}, LooseOctree)
		return self:constructor(...) or self
	end
	function LooseOctree:constructor(position, size, maxDepth, minSize, lenient)
		self.position = emptyVector3
		self.size = emptyVector3
		self.maxDepth = 5
		self.minSize = 50
		self.lenientMinSize = true
		self.contains = {}
		--const newVector: vector = vector.create(x, y, z);
		self.position = position
		self.size = size
		self.maxDepth = maxDepth
		self.minSize = minSize
		self.lenientMinSize = lenient
	end
end
local function Create(px, py, pz, sx, sy, sz)
	--do sum
	local position = vector.create(px, py, pz)
	local size = vector.create(sx, sy, sz)
	local newOctree = LooseOctree.new(position, size, 5, 50, true)
	return newOctree
end
local function Subdivide(timesToSubdivide)
	--do sum
	-- const position: NewVector3 = vector.create(px, py, pz);
	-- const size: NewVector3 = vector.create(sx, sy, sz);
	-- const newOctree = new LooseOctree(position, size, 5, true);
	-- return newOctree;
end
local default = {
	create = Create,
}
--"hi"
return {
	Create = Create,
	Subdivide = Subdivide,
	default = default,
}
