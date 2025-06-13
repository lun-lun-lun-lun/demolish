-- From jackdotink

-- Licensed under the MIT License, Copyright (c) 2024 jack.ink

local function resume_with_error_check(thread: thread, ...: any): ()
	local success, message = coroutine.resume(thread, ...)

	if not success then
		print(string.char(27) .. "[31m" .. message)
	end
end

type Task<T...> = thread | (T...) -> ...any

local last_tick = os.clock()

local waiting_threads: { [thread]: { resume: number } & ({ start: number } | { start: nil, n: number, [number]: any }) } =
	{}

local function process_waiting(): ()
	local processing = waiting_threads
	waiting_threads = {}

	for thread, data in processing do
		if coroutine.status(thread) == "dead" then
		elseif type(data) == "table" and last_tick >= data.resume then
			if data.start then
				resume_with_error_check(thread, last_tick - data.start)
			else
				resume_with_error_check(thread, table.unpack(data, 1, data.n))
			end
		else
			waiting_threads[thread] = data
		end
	end
end

local function wait(time: number): number
	waiting_threads[coroutine.running()] = { resume = last_tick + time, start = last_tick }
	return coroutine.yield()
end

local function delay<T...>(time: number, task: Task<T...>, ...: T...): thread
	local thread = if type(task) == "thread" then task else coroutine.create(task)

	local data: { [any]: any } = table.pack(...)
	data.resume = last_tick + time
	waiting_threads[thread] = data

	return thread
end

local deferred_threads: { { thread: thread, args: { [number]: any, n: number } } } = {}

local function process_deferred(): ()
	local i = 1

	while i <= #deferred_threads do
		local data = deferred_threads[i]

		if coroutine.status(data.thread) ~= "dead" then
			resume_with_error_check(data.thread, table.unpack(data.args))
		end

		i += 1
	end

	table.clear(deferred_threads)
end

local function defer<T...>(task: Task<T...>, ...: T...): thread
	local thread = if type(task) == "thread" then task else coroutine.create(task)
	table.insert(deferred_threads, { thread = thread, args = table.pack(...) })

	return thread
end

local function spawn<T...>(task: Task<T...>, ...: T...): thread
	local thread = if type(task) == "thread" then task else coroutine.create(task)
	resume_with_error_check(thread, ...)

	return thread
end

local function close(thread: thread): ()
	coroutine.close(thread)
end

local function start(): never
	while true do
		last_tick = os.clock()

		process_waiting()
		process_deferred()
	end
end

return {
	wait = wait,
	delay = delay,
	defer = defer,
	spawn = spawn,
	close = close,
	start = start,
}