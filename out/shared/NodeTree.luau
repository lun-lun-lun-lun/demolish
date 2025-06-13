--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local AutoCache = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "AutoCache").AutoCache
TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck")
-- import { pointInBox } from './CollisionCheck';
-- import { box } from './CollisionCheck';
-- import { sphereInSphere } from './CollisionCheck';
-- import { boxInBox } from './CollisionCheck';
local sphereInSphere = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "CollisionCheck").sphereInSphere
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
	templatePart.Transparency = 0
	templatePart.CastShadow = false
	templatePart.Shape = Enum.PartType.Block
end
local partCache = AutoCache.new(templatePart, 1000, nil)
--functions
local function squareMagnitude(position)
	return position.x * position.x + position.y * position.y + position.z * position.z
end
local function getBoundingSphere(item)
	local radius
	if item:IsA("BasePart") then
		radius = item.Size.Magnitude / 2
	else
		-- const model = item as Model;
		radius = item:GetExtentsSize().Magnitude / 2
	end
	return radius
end
local function displayTree(shape, tree)
	--
end
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
	function NodeTree:constructor(cFrame, size, children, maxDepth)
		-- if (childNodes !== undefined) {
		--   this.childNodes = childNodes;
		-- }
		-- if (depth !== undefined) {
		--   this.depth = depth;
		-- }
		self.itemCache = partCache
		self.cFrame = EMPTY_CFRAME
		self.size = EMPTY_VECTOR
		self.children = { {} }
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
	end
	function NodeTree:_getNodeOffsetAndSize(node)
		local position = self.cFrame.Position
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
				--from right to left, extract 3 bits from the binary sequence and convert it to an actual number
				local octreePositionIndex = bit32.extract(node, binaryLength - i - 2, 3) + 1
				local octreePosition = octreePositions[octreePositionIndex]
				local stepAxes = { stepX * octreePosition.x, stepY * octreePosition.y, stepZ * octreePosition.z }
				--we only need to make a vector of this at the end. for now, we use an array, since theyre slightly faster
				newPosition = { newPosition[1] + stepAxes[1], newPosition[2] + stepAxes[2], newPosition[3] + stepAxes[3] }
				-- i += 3;
				stepX, stepY, stepZ = stepX / 2, stepY / 2, stepZ / 2
			end
		end
		return { vector.create(newPosition[1], newPosition[2], newPosition[3]), vector.create(stepX * 4, stepY * 4, stepZ * 4) }
	end
	function NodeTree:display(shape, color, node, time)
		local children = self.children
		local displayParts = {}
		local startingNode = 1
		if node ~= nil then
			startingNode = node
		end
		--if the node has children...
		if children[startingNode * 8 + 1] ~= nil then
			for i = 0, 7 do
				local _array = {}
				local _length = #_array
				local _displayPartsLength = #displayParts
				table.move(displayParts, 1, _displayPartsLength, _length + 1, _array)
				_length += _displayPartsLength
				local _array_1 = self:display(Enum.PartType.Block, color, startingNode * 8 + i)
				table.move(_array_1, 1, #_array_1, _length + 1, _array)
				displayParts = _array
			end
		else
			--display the part
			local nodePart = partCache:get()
			nodePart.Color = Color3.fromRGB(255, 255, 0)
			local _binding = self:_getNodeOffsetAndSize(startingNode)
			local position = _binding[1]
			local size = _binding[2]
			nodePart.Size = size
			--will optimize further later by calcing the new size in the previous function and sending it to the children
			--alsoo need to do a less.. silly calc in general
			nodePart.Shape = shape
			nodePart.Parent = Workspace
			nodePart.CFrame = self.cFrame:ToWorldSpace(CFrame.new(position))
			if time ~= nil then
				task.spawn(function()
					task.wait(time)
					partCache["return"](partCache, nodePart)
				end)
			end
			table.insert(displayParts, nodePart)
		end
		return displayParts
	end
	function NodeTree:divide8(node, timesToDivide, divisions)
		-- const depth = this.depth;
		-- const childNodes = this.childNodes;
		if divisions == nil then
			divisions = 0
		end
		local children = self.children
		local shiftedNode = node * 8
		local newNodes = {}
		if divisions >= timesToDivide then
			return newNodes
		end
		for i = 0, 7 do
			children[shiftedNode + i] = {}
			local additions = self:divide8(shiftedNode + i, timesToDivide, divisions + 1)
			local _newNodes = newNodes
			local _arg0 = shiftedNode + i
			table.insert(_newNodes, _arg0)
			local _array = {}
			local _length = #_array
			local _newNodesLength = #newNodes
			table.move(newNodes, 1, _newNodesLength, _length + 1, _array)
			_length += _newNodesLength
			table.move(additions, 1, #additions, _length + 1, _array)
			newNodes = _array
			-- task.wait();
			-- this.subNodes[shiftedNode + i] = [];
		end
		return newNodes
	end
end
local SphereTree
do
	local super = NodeTree
	SphereTree = setmetatable({}, {
		__tostring = function()
			return "SphereTree"
		end,
		__index = super,
	})
	SphereTree.__index = SphereTree
	function SphereTree.new(...)
		local self = setmetatable({}, SphereTree)
		return self:constructor(...) or self
	end
	function SphereTree:constructor(position, radius, children, maxDepth, maxItems)
		super.constructor(self, nil, nil)
		self.position = EMPTY_VECTOR
		self.radius = 5
		self.maxDepth = 4
		self.maxItems = 5
		self.position = position
		self.radius = radius
		if children ~= nil then
			self.children = children
		end
		if maxDepth ~= nil then
			self.maxDepth = maxDepth
		end
		if maxItems ~= nil then
			self.maxItems = maxItems
		end
	end
	function SphereTree:_display(color, node, time)
		local children = self.children
		local displayParts = {}
		local startingNode = 1
		if node ~= nil then
			startingNode = node
		end
		--if the node has children...
		if children[startingNode * 8 + 1] ~= nil then
			for i = 0, 7 do
				local _array = {}
				local _length = #_array
				local _displayPartsLength = #displayParts
				table.move(displayParts, 1, _displayPartsLength, _length + 1, _array)
				_length += _displayPartsLength
				local _array_1 = self:_display(color, startingNode * 8 + i)
				table.move(_array_1, 1, #_array_1, _length + 1, _array)
				displayParts = _array
			end
		else
			--display the part
			local nodePart = partCache:get()
			nodePart.Color = Color3.fromRGB(26, 0, 255)
			local _binding = self:_getNodeOffsetAndRadius(startingNode)
			local offset = _binding[1]
			local radius = _binding[2]
			nodePart.Size = vector.create(radius, radius, radius)
			--will optimize further later by calcing the new size in the previous function and sending it to the children
			--alsoo need to do a less.. silly calc in general
			nodePart.Shape = Enum.PartType.Ball
			nodePart.Parent = Workspace
			nodePart.Transparency = 0.8
			nodePart.Position = vector.create(self.position.x + offset.x, self.position.y + offset.y, self.position.z + offset.z)
			if time ~= nil then
				task.spawn(function()
					task.wait(time)
					partCache["return"](partCache, nodePart)
				end)
			end
			table.insert(displayParts, nodePart)
		end
		return displayParts
	end
	function SphereTree:_reassignItems(node, nodePosition)
		--
		local children = self.children
		local maxDepth = self.maxDepth
		local maxItems = self.maxItems
		self:divide8(node, 1)
		local nodeArray = children[node]
		local nodeChildrenIndex = node * 8
		for i = 0, #nodeArray - 1 do
			local item = nodeArray[i + 1]
			local itemPosition = item:GetPivot().Position
			local nodePositionIndex = 0
			if itemPosition.X > nodePosition[1] then
				nodePositionIndex += 4
			end
			if itemPosition.Y > nodePosition[2] then
				nodePositionIndex += 2
			end
			if itemPosition.Z > nodePosition[3] then
				nodePositionIndex += 1
			end
			local _exp = children[nodeChildrenIndex + nodePositionIndex]
			table.insert(_exp, item)
		end
		table.clear(nodeArray)
	end
	function SphereTree:insertPart(part)
		local depth = 0
		local step = self.radius / 4
		local chosenNode = 1
		local children = self.children
		local maxDepth = self.maxDepth
		local maxItems = self.maxItems
		local partPosition = part.Position
		local partPositionX, partPositionY, partPositionZ = partPosition.X, partPosition.Y, partPosition.Z
		local position = self.position
		local nodePosition = { position.x, position.y, position.z }
		local nodePositionX, nodePositionY, nodePositionZ = nodePosition[1], nodePosition[2], nodePosition[3]
		while part do
			local nodePositionIndex = 0
			if partPositionX > nodePositionX then
				nodePositionIndex += 4
			end
			if partPositionY > nodePositionY then
				nodePositionIndex += 2
			end
			if partPositionZ > nodePositionZ then
				nodePositionIndex += 1
			end
			local nextNode = chosenNode * 8 + nodePositionIndex
			--Found a suitable leaf (empty) node?
			if children[nextNode + 1] == nil then
				--put our part in the parent of that leaf node
				local chosenNodeArray = children[chosenNode]
				local _part = part
				table.insert(chosenNodeArray, _part)
				--divide that node if there are too many things in it
				if #chosenNodeArray > maxItems and depth < maxDepth then
					self:_reassignItems(chosenNode, nodePosition)
				end
				break
			end
			nodePosition = { nodePosition[1] + step * octreePositions[nodePositionIndex + 1].x, nodePosition[2] + step * octreePositions[nodePositionIndex + 1].y, nodePosition[3] + step * octreePositions[nodePositionIndex + 1].z }
			step /= 2
			chosenNode = nextNode
			depth += 1
		end
	end
	function SphereTree:removePart(part)
		local step = self.radius / 4
		local chosenNode = 1
		local children = self.children
		local maxDepth = self.maxDepth
		local maxItems = self.maxItems
		local partPosition = part.Position
		local partPositionX, partPositionY, partPositionZ = partPosition.X, partPosition.Y, partPosition.Z
		local position = self.position
		local nodePosition = { position.x, position.y, position.z }
		local nodePositionX, nodePositionY, nodePositionZ = nodePosition[1], nodePosition[2], nodePosition[3]
		while part do
			local nodePositionIndex = 0
			if partPositionX > nodePositionX then
				nodePositionIndex += 4
			end
			if partPositionY > nodePositionY then
				nodePositionIndex += 2
			end
			if partPositionZ > nodePositionZ then
				nodePositionIndex += 1
			end
			local nextNode = chosenNode * 8 + nodePositionIndex
			--Found a suitable leaf (empty) node?
			if children[nextNode + 1] == nil then
				--put our part in the parent of that leaf node
				local leafNode = children[chosenNode]
				local _part = part
				local index = (table.find(leafNode, _part) or 0) - 1
				if index ~= -1 then
					table.remove(leafNode, index + 1)
				end
				break
			end
			nodePosition = { nodePosition[1] + step * octreePositions[nodePositionIndex + 1].x, nodePosition[2] + step * octreePositions[nodePositionIndex + 1].y, nodePosition[3] + step * octreePositions[nodePositionIndex + 1].z }
			step /= 2
			chosenNode = nextNode
		end
	end
	function SphereTree:_getNodeOffsetAndRadius(node)
		local position = self.position
		--the length of the binary sequence for our node number
		--we subtract one because the for loop will run at least once
		--additionally, NumberLength should always be a multiple of 3, because its only possible for us to get certain nodes, ie those in: 1 U [8,15] U [64,71] etc
		local binaryLength = math.max(32 - bit32.countlz(node), 0) - 1
		local step = self.radius / 4
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
				--from right to left, extract 3 bits from the binary sequence and convert it to an actual number
				local octreePositionIndex = bit32.extract(node, binaryLength - i - 2, 3) + 1
				local octreePosition = octreePositions[octreePositionIndex]
				local stepAxes = { step * octreePosition.x, step * octreePosition.y, step * octreePosition.z }
				--we only need to make a vector of this at the end. for now, we use an array, since theyre slightly faster
				newPosition = { newPosition[1] + stepAxes[1], newPosition[2] + stepAxes[2], newPosition[3] + stepAxes[3] }
				-- i += 3;
				step /= 2
			end
		end
		return { vector.create(newPosition[1], newPosition[2], newPosition[3]), step * 4 * BOX_SPHERE_CONSTANT }
	end
	function SphereTree:query(queryPosition, queryRadius)
		queryRadius *= queryRadius
		local children = self.children
		local position = self.position
		local positionX, positionY, positionZ = position.x, position.y, position.z
		local chosenNodes = { 1 }
		local detectedItems = {}
		while #chosenNodes > 0 do
			-- ▼ Array.pop ▼
			local _length = #chosenNodes
			local _result = chosenNodes[_length]
			chosenNodes[_length] = nil
			-- ▲ Array.pop ▲
			local node = _result
			local nodeItems = children[node]
			local _binding = self:_getNodeOffsetAndRadius(node)
			local nodeOffset = _binding[1]
			local nodeRadius = _binding[2]
			local nodePosition = vector.create(positionX + nodeOffset.x, positionY + nodeOffset.y, positionZ + nodeOffset.z)
			--if approximated spheres not touching, then continue
			if not sphereInSphere(nodePosition, nodeRadius, queryPosition, queryRadius) then
				continue
			end
			local childPosition = node * 8
			--justr image its 'octreepositionindex' instead of posIndex here. Way too long and im not writing allat
			for posIndex = 0, 7 do
				local nextNode = childPosition + posIndex
				if children[nextNode] == nil then
					if #nodeItems > 0 then
						for _, item in nodeItems do
							local collided = sphereInSphere(item:GetPivot().Position, getBoundingSphere(item), queryPosition, queryRadius)
							if collided == true then
								table.insert(detectedItems, item)
							end
						end
					end
					break
				end
				table.insert(chosenNodes, nextNode)
			end
		end
		return detectedItems
	end
end
--will probably make a DemoTree class later that is built specifically with al the functions to destroy parts
return {
	partCache = partCache,
	NodeTree = NodeTree,
	SphereTree = SphereTree,
}
