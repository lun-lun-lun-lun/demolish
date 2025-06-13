--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local RunService = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").RunService
--define a type that can be either a part or a model
--constant representing a far away position
local FAR = 5000
--the default location where cached objects are hidden
local DEFAULT_CACHE_POSITION = CFrame.new(FAR, FAR, FAR)
--maximum number of instances allowed in the cache
local MAX_CACHED_INSTANCES = 9999
--stores all autocache instances in the game
local allCaches = {}
--the rate at which the cache gets another part until it reaches its maximum
local rates = {
	increase = 1,
}
--an automatically increasing cache of parts or models
local AutoCache
do
	AutoCache = setmetatable({}, {
		__tostring = function()
			return "AutoCache"
		end,
	})
	AutoCache.__index = AutoCache
	function AutoCache.new(...)
		local self = setmetatable({}, AutoCache)
		return self:constructor(...) or self
	end
	function AutoCache:constructor(template, amount, position)
		self.template = nil
		self.cache = {}
		self.hiddenCframe = DEFAULT_CACHE_POSITION
		self.cframeTable = {}
		self.maximum = MAX_CACHED_INSTANCES
		self.usedThisHeartbeat = false
		self.template = template
		--if a custom hiding position is given use it otherwise use the default
		self.hiddenCframe = if position ~= nil then CFrame.new(position.x, position.y, position.z) else self.hiddenCframe
		--create a table with the same cframe for bulk moving instances
		self.cframeTable = table.create(amount, self.hiddenCframe)
		--add the initial number of instances to the cache
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
		--move all cached instances to the hidden position using bulkmoveto
		Workspace:BulkMoveTo(self.cache, self.cframeTable, Enum.BulkMoveMode.FireCFrameChanged)
		--add this cache instance to the list of all caches
		local _self = self
		table.insert(allCaches, _self)
	end
	function AutoCache:_addItem(item)
		if item:IsA("Part") then
			item.Anchored = true
			--item.CanCollide = false;
		else
			--anchor all parts inside a model
			for _, subItem in item:GetDescendants() do
				if subItem:IsA("Part") == true and subItem.Anchored == false then
					subItem.Anchored = true
				end
			end
		end
		--move the item to the workspace and add it to the cache
		item.Parent = Workspace
		local _cache = self.cache
		local _item = item
		table.insert(_cache, _item)
	end
	function AutoCache:_addClone(originalItem)
		local item = originalItem:Clone()
		if item:IsA("Part") then
			item.Anchored = true
		else
			--anchor all unanchored parts inside the model
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
	function AutoCache:add(amount)
		self.usedThisHeartbeat = true
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
	function AutoCache:get()
		self.usedThisHeartbeat = true
		table.remove(self.cframeTable, 1)
		return table.remove(self.cache, 1)
	end
	AutoCache["return"] = function(self, item)
		self.usedThisHeartbeat = true
		local template = self.template
		--move the item back to the template's parent
		item.Parent = template.Parent
		--set attributes to match the template skipping uniqueid
		for _k, _v in template:GetAttributes() do
			local attribute = { _k, _v }
			local name, value = attribute[1], attribute[2]
			if name == "UniqueId" then
				continue
			end
			item:SetAttribute(name, value)
		end
		--if the item is a part, match physical properties and hide it
		if item:IsA("Part") and template:IsA("Part") then
			item.Color = template.Color
			item.Shape = template.Shape
			item.Size = template.Size
			item.CFrame = self.hiddenCframe
			self:_addItem(item)
		elseif item:IsA("Model") and template:IsA("Model") then
			--if the item is a model, destroy it and replace with a new clone
			--i didnt end up using models in the cache anyway so this horrendous idea never affected anything
			item:Destroy()
			self:_addClone(template)
		end
	end
end
--runs every heartbeat to check each cache every frame to see if we need to add a part or not
RunService.Heartbeat:Connect(function(deltaTime)
	for _, iCache in allCaches do
		local cacheUsed = iCache.usedThisHeartbeat
		if cacheUsed == true then
			--reset check for use on this frame for next heartbeat
			iCache.usedThisHeartbeat = false
		elseif cacheUsed == false and #iCache.cache < iCache.maximum then
			--if cache wasnt used and not full yet, add more instances
			local increase = if #iCache.cache + rates.increase > iCache.maximum then iCache.maximum - #iCache.cache else rates.increase
			do
				local i = 0
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						i += 1
					else
						_shouldIncrement = true
					end
					if not (i < increase) then
						break
					end
					iCache:_addItem(iCache.template:Clone())
				end
			end
		end
	end
end)
local default = rates
--export default {};
return {
	rates = rates,
	AutoCache = AutoCache,
	default = default,
}
