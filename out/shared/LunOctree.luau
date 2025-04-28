--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
--Types in TS us PascalCase
local EmptyVector3 = vector.create(0, 0, 0)
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
		self.position = EmptyVector3
		self.size = EmptyVector3
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
		self.originNode = originNode
		self.parentNode = parentNode
		--show  avisual representation
		self:display("Block")
	end
	function OctreeNode:display(shape)
		local nodePart = templatePart:Clone()
		nodePart.Color = Color3.fromRGB(math.random(1, 255), math.random(1, 255), math.random(1, 255))
		nodePart.Position = vectorToVector3(self.position)
		nodePart.Size = vectorToVector3(self.size)
		nodePart.Parent = Workspace
		nodePart.Shape = Enum.PartType[shape]
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
		local offsetX, offsetY, offsetZ = -stepX / 2 + originNode.position.x, stepY - stepY / 2 + originNode.position.y, -stepZ / 2 + originNode.position.z
		local newSize = vector.create(sizeX / 2, sizeY / 2, sizeZ / 2)
		--create 8 properly sized, equally spaced nodes within the AABB of the Octree
		for y = 0, 1 do
			local newY = stepY * -y + offsetY
			for z = 0, 1 do
				local newZ = stepZ * z + offsetZ
				for x = 0, 1 do
					local newX = stepX * x + offsetX
					local newPosition = vector.create(newX, newY, newZ)
					local newNode = OctreeNode.new(newPosition, newSize, depth + 1, maxDepth, minSize, lenientMinSize, self.originNode, self)
					local _exp = self.childNodes
					table.insert(_exp, newNode)
					local realCurrentDivision = if currentDivision == nil then 1 else currentDivision
					print(realCurrentDivision)
					print(currentDivision, realCurrentDivision)
					if realCurrentDivision < 2 then
						print("we should divide")
						newNode:divide(timesToDivide, realCurrentDivision + 1)
					end
					--task.wait(0);
					--newNode.display('Block');
				end
			end
		end
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
local function Create(px, py, pz, sx, sy, sz, maxDepth, minSize, lenientMinSize)
	--do sum
	local position = vector.create(px, py, pz)
	local size = vector.create(sx, sy, sz)
	local newOctree = OctreeNode.new(position, size, 0, maxDepth, minSize, lenientMinSize, nil, nil)
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
