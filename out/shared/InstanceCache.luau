--!native
--!optimize 2
-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Workspace = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local cache = {}
local FAR = 9999
local DEFAULT_CACHE_POSITION = CFrame.new(FAR, FAR, FAR)
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
	function InstanceCache:constructor(templatePart, amount, position)
		self.cache = {}
		self.hideCFrame = DEFAULT_CACHE_POSITION
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
				local templateClone = templatePart:Clone()
				templateClone.Parent = Workspace
				--   if (type(templateClone) === "") {
				--   }
				local _exp = self.cache
				table.insert(_exp, templateClone)
				self.hideCFrame = if position ~= nil then CFrame.new(position.x, position.y, position.z) else DEFAULT_CACHE_POSITION
				templateClone:PivotTo(self.hideCFrame)
			end
		end
	end
	function InstanceCache:getPart()
		for _, thing in self.cache do
			return thing
		end
	end
end
local default = {}
return {
	InstanceCache = InstanceCache,
	default = default,
}
