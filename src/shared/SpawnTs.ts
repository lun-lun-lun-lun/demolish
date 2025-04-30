//module for recycling threads when possible to boost performance
//originally made by jackdotink, translated to rbxts by me

//local FreeThreads: { thread } = {}
const freeThreads: thread[] = [];

// local function RunCallback(Callback, Thread, ...)
// 	Callback(...)
// 	table.insert(FreeThreads, Thread)
// end
function RunCallback(
  callback: (...idk: unknown[]) => void,
  thread: thread,
  ...args: unknown[]
) {
  callback(...args);
  freeThreads.push(thread);
}
// local function Yielder()
// 	while true do
// 		RunCallback(coroutine.yield())
// 	end
// end
const isTrue = true;
function Yielder() {
  while (isTrue) {
    const yielded = coroutine.yield() as unknown[];
    const callback = yielded[0] as (...args: unknown[]) => void;
    const thread = yielded[1] as thread;
    const args = table.create(yielded.size() - 2);
    for (let i = 2; i < yielded.size(); i++) {
      args[i - 2] = yielded[i];
    }
    RunCallback(callback, thread, ...args);
  }
}

// return function<T...>(Callback: (T...) -> (), ...: T...)
// 	local Thread
// 	if #FreeThreads > 0 then
// 		Thread = FreeThreads[#FreeThreads]
// 		FreeThreads[#FreeThreads] = nil
// 	else
// 		Thread = coroutine.create(Yielder)
// 		coroutine.resume(Thread)
// 	end

// 	task.spawn(Thread, Callback, Thread, ...)
// end;

export function Spawn<T>(
  callback: (...idk: unknown[]) => void,
  ...args: T[]
) {
  let thread;
  const totalFreeThreads = freeThreads.size();
  if (totalFreeThreads > 0) {
    thread = freeThreads[totalFreeThreads - 1];
    freeThreads[totalFreeThreads - 1] =
      undefined as unknown as thread;
  } else {
    thread = coroutine.create(Yielder);
    coroutine.resume(thread);
  }

  task.spawn(thread, callback, thread, ...args);
}
