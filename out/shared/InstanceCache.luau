--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local cache = {}
local FAR = 9999
local DEFAULT_CACHE_POSITION = CFrame.new(0, FAR, 0)
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
	function InstanceCache:constructor(template, amount, position, maximum)
		self.template = nil
		self.cache = {}
		self.hiddenCframe = DEFAULT_CACHE_POSITION
		self.cframeTable = {}
		self.maximum = 9000
		self.maximum = maximum
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
				self:_addNew(template:Clone())
			end
		end
		--becomes faster than manually moving each model after ~50 moves
		Workspace:BulkMoveTo(self.cache, self.cframeTable, Enum.BulkMoveMode.FireCFrameChanged)
	end
	function InstanceCache:_addNew(item)
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
	function InstanceCache:get()
		print(#self.cache)
		table.remove(self.cframeTable, 1)
		return table.remove(self.cache, 1)
	end
	InstanceCache["return"] = function(self)
		task.defer(function() end)
		-- Spawn(function () {
		--   print('hiiii');
		-- });
	end
end
--export default {};
return {
	InstanceCache = InstanceCache,
}
