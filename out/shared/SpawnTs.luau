-- Compiled with roblox-ts v3.0.0
--module for recycling threads when possible to boost performance
--originally made by jackdotink, translated to rbxts by me
--local FreeThreads: { thread } = {}
local freeThreads = {}
-- local function RunCallback(Callback, Thread, ...)
-- 	Callback(...)
-- 	table.insert(FreeThreads, Thread)
-- end
local function RunCallback(callback, thread, ...)
	local args = { ... }
	callback(unpack(args))
	local _thread = thread
	table.insert(freeThreads, _thread)
end
-- local function Yielder()
-- 	while true do
-- 		RunCallback(coroutine.yield())
-- 	end
-- end
local isTrue = true
local function Yielder()
	while isTrue do
		local yielded = coroutine.yield()
		local callback = yielded[1]
		local thread = yielded[2]
		local args = table.create(#yielded - 2)
		for i = 2, #yielded - 1 do
			args[i - 1] = yielded[i + 1]
		end
		RunCallback(callback, thread, unpack(args))
	end
end
-- return function<T...>(Callback: (T...) -> (), ...: T...)
-- 	local Thread
-- 	if #FreeThreads > 0 then
-- 		Thread = FreeThreads[#FreeThreads]
-- 		FreeThreads[#FreeThreads] = nil
-- 	else
-- 		Thread = coroutine.create(Yielder)
-- 		coroutine.resume(Thread)
-- 	end
-- 	task.spawn(Thread, Callback, Thread, ...)
-- end;
local function Spawn(callback, ...)
	local args = { ... }
	local thread
	local totalFreeThreads = #freeThreads
	if totalFreeThreads > 0 then
		thread = freeThreads[totalFreeThreads]
		freeThreads[totalFreeThreads] = nil
	else
		thread = coroutine.create(Yielder)
		coroutine.resume(thread)
	end
	task.spawn(thread, callback, thread, unpack(args))
end
return {
	Spawn = Spawn,
}
