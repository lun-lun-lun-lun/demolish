--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local RunService = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").RunService
local FAR = 9999
local DEFAULT_CACHE_POSITION = CFrame.new(0, FAR, 0)
local allCaches = {}
--const MAX_CACHED_INSTANCES = 9000;
local InstanceCache
do
	InstanceCache = setmetatable({}, {
		__tostring = function()
			return "InstanceCache"
		end,
	})
	InstanceCache.__index = InstanceCache
	function InstanceCache.new(...)
		local self = setmetatable({}, InstanceCache)
		return self:constructor(...) or self
	end
	function InstanceCache:constructor(template, amount, position)
		self.template = nil
		self.cache = {}
		self.hiddenCframe = DEFAULT_CACHE_POSITION
		self.cframeTable = {}
		self.maximum = 9000
		self.usedThisFrame = false
		self.template = template
		--if you gave a position, we'll use it
		self.hiddenCframe = if position ~= nil then CFrame.new(position.x, position.y, position.z) else self.hiddenCframe
		--make a table with the cframe repeated over and over for use with BulkMoveTo
		self.cframeTable = table.create(amount, self.hiddenCframe)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < amount) then
					break
				end
				self:_addClone(template)
			end
		end
		--becomes faster than manually moving each model after ~50 moves
		Workspace:BulkMoveTo(self.cache, self.cframeTable, Enum.BulkMoveMode.FireCFrameChanged)
	end
	function InstanceCache:_addItem(item)
		if item:IsA("Part") then
			item.Anchored = true
		else
			for _, subItem in item:GetDescendants() do
				if subItem:IsA("Part") == true and subItem.Anchored == false then
					subItem.Anchored = true
				end
			end
		end
		item.Parent = Workspace
		local _cache = self.cache
		local _item = item
		table.insert(_cache, _item)
	end
	function InstanceCache:_addClone(originalItem)
		local item = originalItem:Clone()
		if item:IsA("Part") then
			item.Anchored = true
		else
			for _, subItem in item:GetDescendants() do
				if subItem:IsA("Part") == true and subItem.Anchored == false then
					subItem.Anchored = true
				end
			end
		end
		item.Parent = Workspace
		local _exp = self.cache
		table.insert(_exp, item)
	end
	function InstanceCache:add(amount)
		self.usedThisFrame = true
		local repeats = if amount == nil then 1 else amount
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < repeats) then
					break
				end
				self:_addClone(self.template)
			end
		end
	end
	function InstanceCache:get()
		self.usedThisFrame = true
		table.remove(self.cframeTable, 1)
		return table.remove(self.cache, 1)
	end
	InstanceCache["return"] = function(self, item)
		self.usedThisFrame = true
		local template = self.template
		--fire destroy or something? it wasnt really destroyed though... not sure
		--for now i'll ignore things like that since they are irrelevant to my usecase, mostly
		item.Parent = template.Parent
		--set miscellaneous attributes
		for _k, _v in template:GetAttributes() do
			local attribute = { _k, _v }
			--need to skip GUID, they should be unique to each instance (will add GUIDs later btw)
			local name, value = attribute[1], attribute[2]
			if name == "UniqueId" then
				continue
			end
			item:SetAttribute(name, value)
		end
		if item:IsA("Part") and template:IsA("Part") then
			item.Color = template.Color
			item.Shape = template.Shape
			item.Size = template.Size
			self:_addItem(item)
		elseif item:IsA("Model") and template:IsA("Model") then
			--item.ScaleTo(template.GetScale());
			--would theoretically have to handle getting back removed children too?
			--sounds like too much work for a part of it im not really using
			item:Destroy()
			self:_addClone(template)
		end
	end
end
RunService.Heartbeat:Connect(function(deltaTime)
	for _, cache in allCaches do
		--print(cache);
		cache.usedThisFrame = false
	end
end)
--export default {};
return {
	InstanceCache = InstanceCache,
}
