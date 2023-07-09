/*
 export function promisify<T1, T2, T3, T4, T5, TResult>(
    fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callback: (err: any, result: TResult) => void) => void
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TResult>;
*/

/**
  Discriminant for {@linkcode Pending}, {@linkcode Resolved}, and
  {@linkcode Rejected} variants of the {@linkcode Task} type.

  You can use the discriminant via the `variant` property of `Task` instances
  if you need to match explicitly on it.
 */
export const Variant = {
  Pending: 'Pending',
  Resolved: 'Resolved',
  Rejected: 'Rejected',
} as const;

export type Variant = keyof typeof Variant;

type Repr<T, E> = [tag: 'Pending'] | [tag: 'Resolved', value: T] | [tag: 'Rejected', reason: E];

// TODO: nope, this is the wrong approach. This is a *mutating* approach which
// updates the internal state of this single object. What we actually want and
// need here is an approach that instead produces a *new* `Task` when a promise
// resolves or rejects, or when a Node callback resolves (using `Promise`s as
// the underlying mechanic there as well, probably?), or when a general-purpose
// task works.
class TaskImpl<T, E> {
  #repr: Repr<T, E> = ['Pending'];
  #promise: Promise<T>;
  #onErr: (error: unknown) => E;

  private constructor(promise: Promise<T>, onErr: (error: unknown) => E) {
    this.#promise = promise;
    this.#onErr = onErr;

    // SAFETY: these two callbacks *must* preserve the shape of `Repr`, but the
    // type system does not check us here. This does in-place mutation rather
    // than allocation new arrays to minimize the performance cost
    promise.then(
      (value) => {
        this.#repr[0] = 'Resolved';
        this.#repr[1] = value;
      },
      (reason) => this.#repr.splice(0, 2, 'Rejected', onErr(reason))
    );
  }

  // TODO: implement `static of`: what is a reasonable general-purpose Task API?

  static fromPromise<A, B>(promise: Promise<A>, onErr: (error: unknown) => B): Task<A, B> {
    return new TaskImpl(promise, onErr);
  }

  map<U>(mapFn: (t: T) => U): Task<U, E> {
    return Task.fromPromise(this.#promise.then(mapFn), this.#onErr);
  }

  andThen<U>(andThenFn: (t: T) => Task<U, E>): Task<U, E> {
    let newPromise = this.#promise.then((value) => andThenFn(value).#promise);
    return Task.fromPromise(newPromise, this.#onErr);
  }
}

type NodeFn<T, Args extends any[]> = (
  ...args: [...Args, (err: unknown, result: T) => void]
) => void;

/**
  Like Node's `utils.promisify`, but for {@linkcode Task}: given a Node callback
  function and a function to handle the error, produce a `Task<T, E>` from it.
 */
export function taskify<T, E, Args extends any[]>(
  fn: NodeFn<T, Args>,
  onErr: (err: unknown) => E
): (...args: Args) => Task<T, E> {
  return (...args) =>
    Task.fromPromise(
      new Promise<T>((resolve, reject) => {
        fn(...args, (err: unknown, result: T) => {
          if (err !== undefined) reject(err);
          else resolve(result);
        });
      }),
      onErr
    );
}

interface Pending<T, E> extends TaskImpl<T, E> {}
interface Resolved<T, E> extends TaskImpl<T, E> {}
interface Rejected<T, E> extends TaskImpl<T, E> {}

export interface TaskConstructor {
  fromPromise: typeof TaskImpl.fromPromise;
}

type Task<T, E> = Pending<T, E> | Resolved<T, E> | Rejected<T, E>;
const Task = TaskImpl as TaskConstructor;
export default Task;
