// From jackdotink

type Task<T extends unknown[] = unknown[]> = thread | ((...args: T) => unknown);

interface JackSpawn {
  /**
   * yields current thread for the given time
   * Returns elapsed time
   */
  wait(time: number): number;

  /**
   * schedules a task or thread to run after a time delay
   * Returns the thread
   */
  delay<T extends unknown[]>(time: number, task: Task<T>, ...args: T): thread;

  /**
   * schedules a task or thread to run as soon as possible (after current cycle)
   * Returns the thread.
   */
  defer<T extends unknown[]>(task: Task<T>, ...args: T): thread;

  /**
   * resumes a task/thread with given arguments
   * Returns the thread
   */
  spawn<T extends unknown[]>(task: Task<T>, ...args: T): thread;

  /**
   * closes thread
   * Returns nothing
   */
  close(thread: thread): void;

  /**
   * starts JackSpawn scheduler loop
   * Returns nothing
   */
  start(): never;
}

declare const JackSpawn: JackSpawn;
export = JackSpawn;
