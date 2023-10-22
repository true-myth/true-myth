const Pending = 0;
type Pending = typeof Pending;

const Resolved = 1;
type Resolved = typeof Resolved;

const Rejected = 2;
type Rejected = typeof Rejected;

type Repr<T, E> = [Pending] | [Resolved, value: T] | [Rejected, reason: E];

interface Executor<T, E> {
  (f: { succeed(value: T): void; fail(reason: E): void; cancel(): void }): void;
}

export default class Task<T, E> {
  #repr: Repr<T, E>;
  #promise: Promise<T>;

  static forPromise<T, E>(promise: Promise<T>, onRejection: (reason: unknown) => E) {
    return new this(({ succeed, fail }) => {
      promise.then(succeed, (reason) => fail(onRejection(reason)));
    });
  }

  private constructor(executor: Executor<T, E>) {
    this.#repr = [Pending];
    executor({
      succeed: this.#succeed,
      fail: this.#fail,
      cancel: () => {},
    });
  }

  #succeed(value: T): void {
    this.#repr = [Resolved, value];
  }

  #fail(reason: E): void {
    this.#repr = [Rejected, reason];
  }

  andThen<U, E>(andThenFn: (value: T) => Task<U, E>): Task<U, E> {
    let task = new Task<U, E>(({ succeed, fail }) => {
      this.#promise.then(() => {
        switch (this.#repr[0]) {
          case Pending: {
            throw new InternalError('Resolved task but state is `Pending`.');
          }
          case Resolved: {
            let nextTask = andThenFn(this.#repr[1]);
            task.#repr = nextTask.#repr;
            return;
          }
          case Rejected: {
            task.#fail(this.#repr[1]);
            return;
          }
        }
      });
    });
    return task;
  }

  cast() {
    return this;
  }
}

class InternalError extends Error {
  // todo: 'this is an implementation issue; please file a bug'
}
