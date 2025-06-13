// From the jackdotink
// Type definitions for JackSpawn.luau

type Task<T extends unknown[] = unknown[]> = thread | ((...args: T) => unknown);

interface JackSpawn {
  /**
   * Yields the current thread for the given time (in seconds).
   * Returns the elapsed time.
   */
  wait(time: number): number;

  /**
   * Schedules a task or thread to run after a delay (in seconds).
   * Returns the thread.
   */
  delay<T extends unknown[]>(time: number, task: Task<T>, ...args: T): thread;

  /**
   * Schedules a task or thread to run as soon as possible, after the current cycle.
   * Returns the thread.
   */
  defer<T extends unknown[]>(task: Task<T>, ...args: T): thread;

  /**
   * Immediately resumes a task or thread with the given arguments.
   * Returns the thread.
   */
  spawn<T extends unknown[]>(task: Task<T>, ...args: T): thread;

  /**
   * Closes the given thread.
   */
  close(thread: thread): void;

  /**
   * Starts the JackSpawn scheduler loop (never returns).
   */
  start(): never;
}

declare const JackSpawn: JackSpawn;
export = JackSpawn;
