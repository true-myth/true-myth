import { describe, expect, expectTypeOf, test } from 'vitest';

import Task, {
  InvalidAccess,
  Rejected,
  Resolved,
  State,
  TaskExecutorException,
  UnsafePromise,
} from 'true-myth/task';
import Result from 'true-myth/result';
import Unit from 'true-myth/unit';
import { unwrap, unwrapErr } from 'true-myth/test-support';

describe('`Task`', () => {
  describe('constructor', () => {
    test('resolve', async () => {
      let theValue = 123;
      let theTask = new Task<number, string>((resolve) => resolve(theValue));
      let result = await theTask;
      expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
      expect(result.isOk).toBe(true);
      expect(unwrap(result)).toEqual(theValue);
    });

    test('reject', async () => {
      let theReason = 'oh teh noes';
      let theTask = new Task<number, string>((_, reject) => reject(theReason));
      let result = await theTask;
      expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
      expect(result.isErr).toBe(true);
      expect(unwrapErr(result)).toEqual(theReason);
    });

    test('when an error is thrown', async () => {
      // Wire up a promise to wait on this so we can make the test wait till
      // this is done before exiting. Otherwise, the promise may leak across
      // tests.
      let processPromise = new Promise((resolve) => {
        process.on('unhandledRejection', (error) => {
          resolve(error);
        });
      });

      new Task<number, string>((_resolve, _reject) => {
        throw new Error('oh teh noes');
      });

      let output = await processPromise;
      expect(output).toBeInstanceOf(TaskExecutorException);
      expect.assertions(1);
    });
  });

  test('implements the `PromiseLike` API', async () => {
    let result = await Task.try(Promise.resolve('hello'));
    expectTypeOf(result).toEqualTypeOf<Result<string, unknown>>();
    expect(unwrap(result)).toBe('hello');
  });

  describe('static constructors', () => {
    describe('withResolvers', () => {
      test('supports resolving', async () => {
        let { task, resolve } = Task.withResolvers<string, never>();
        expectTypeOf(task).toEqualTypeOf<Task<string, never>>();

        let theValue = 'hello';
        resolve(theValue);
        let result = await task;
        expect(unwrap(result)).toEqual(theValue);
      });

      test('supports rejecting', async () => {
        let { task, reject } = Task.withResolvers<never, string>();
        expectTypeOf(task).toEqualTypeOf<Task<never, string>>();

        let theReason = 'le sigh';
        reject(theReason);
        let result = await task;
        expect(unwrapErr(result)).toEqual(theReason);
      });
    });

    describe('`try`', () => {
      test('when the promise resolves', async () => {
        let { promise, resolve } = deferred<number, never>();
        let theTask = Task.try(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();

        resolve(123);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<number, unknown>>();
        expect(unwrap(theResult)).toBe(123);
      });

      test('when the promise rejects', async () => {
        let { promise, reject } = deferred<never, string>();
        let theTask = Task.try(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<never, unknown>>();

        let theError = 'la';
        reject(theError);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<never, unknown>>();
        expect(unwrapErr(theResult)).toEqual(theError);
      });
    });

    describe('`unsafeTrusted`', () => {
      test('when the task resolves', async () => {
        let { promise, resolve } = deferred<Result<number, string>, never>();
        let theTask = Task.unsafeTrusted(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theInputResult = Result.ok<number, string>(123);
        resolve(theInputResult);
        let theResultingResult = await theTask;
        expect(theResultingResult).toEqual(Result.ok(123));
        expectTypeOf(theResultingResult).toEqualTypeOf(theInputResult);
      });

      // This jumps through some hoops to test the underlying behavior here: the
      // way this works under the hood is that the `Task` attaches resolution
      // and rejection callbacks to the passed promise, and in the case of the
      // passed promise *rejecting*, it throws a specific kind of error, but it
      // does so in a promise which is nowhere else exposed, so it is actually
      // *impossible to catch* other than with this kind of top-level unhandled
      // error catching mechanism.
      test('when the task rejects', async () => {
        // Wire up a promise to wait on this so we can make the test wait till
        // this is done before exiting. Otherwise, the promise may leak across
        // tests.
        let processPromise = new Promise((resolve) => {
          process.on('unhandledRejection', (error) => {
            resolve(error);
          });
        });

        let { promise, reject } = deferred<Result<number, string>, unknown>();
        let theTask = Task.unsafeTrusted(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theReason = 'not good';
        try {
          // Yes, we must explicitly await both the task and the original
          // promise, or else the error will not show up deterministically.
          reject(theReason);
          await promise;
          await theTask;
        } catch (e) {
          expect(e).toEqual(theReason);
        }

        let output = await processPromise;
        expect(output).toBeInstanceOf(UnsafePromise);
        expect.assertions(2);
      });
    });

    describe('`tryOr`', () => {
      test('when the task resolves', async () => {
        let { promise, resolve } = deferred<number, string>();
        let theTask = Task.tryOr(promise, 'lolnope');
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolve(123);
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrap(result)).toBe(123);
      });

      test('when the task rejects', async () => {
        let { promise, reject } = deferred<number, string>();
        let theTask = Task.tryOr(promise, 'lolnope');
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        reject('<this value does not matter>');
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrapErr(result)).toBe('lolnope');
      });
    });

    describe('`tryOrElse', () => {
      test('when the task resolves', async () => {
        let { promise, resolve } = deferred<number, never>();
        let theTask = Task.tryOrElse(promise, stringify);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolve(123);
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrap(result)).toBe(123);
      });

      test('when the task rejects', async () => {
        let { promise, reject } = deferred<number, string>();
        let theTask = Task.tryOrElse(promise, stringify);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theError = 'oh teh noes';
        reject(theError);
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrapErr(result)).toBe(stringify(theError));
      });
    });
  });

  describe('static `resolved` constructor', () => {
    test('produces `Task<Unit, never>` when passed no arguments', () => {
      let theTask = Task.resolve();
      expectTypeOf(theTask).toEqualTypeOf<Task<Unit, never>>();
    });

    test('produces `Task<T, never>` when passed a basic argument', () => {
      let theValue = 'hello';
      let theTask = Task.resolve(theValue);
      expectTypeOf(theTask).toEqualTypeOf<Task<typeof theValue, never>>();
    });

    test('allows explicitly setting a type for `E`', () => {
      let rejectedWithUnit = Task.resolve<Unit, string>();
      expectTypeOf(rejectedWithUnit).toEqualTypeOf<Task<Unit, string>>();

      let rejectedWithValue = Task.resolve<string, number>('hello');
      expectTypeOf(rejectedWithValue).toEqualTypeOf<Task<string, number>>();
    });
  });

  describe('static `rejected` constructor', () => {
    test('produces `Task<never, Unit>` when passed no arguments', () => {
      let theTask = Task.reject();
      expectTypeOf(theTask).toEqualTypeOf<Task<never, Unit>>();
    });

    test('produces `Task<never, E>` when passed an argument', () => {
      let theReason = 'uh oh';
      let theTask = Task.reject(theReason);
      expectTypeOf(theTask).toEqualTypeOf<Task<never, typeof theReason>>();
    });

    test('allows explicitly setting a type for `T`', () => {
      let rejectedWithUnit = Task.reject<string>();
      expectTypeOf(rejectedWithUnit).toEqualTypeOf<Task<string, Unit>>();

      let rejectedWithValue = Task.reject<string, number>(123);
      expectTypeOf(rejectedWithValue).toEqualTypeOf<Task<string, number>>();
    });
  });

  // Note to future maintainers: there can be (at present) no path where a known
  // `Ok` or `Err` immediately produces a `Resolved` or `Rejected` respectively,
  // because the `Task` *must* be awaited (i.e. there is a required microtask
  // queue tick because of the underlying promise) before the .
  //
  // We *might* be able to “fast path” that by way of a private constructor, but
  // doing so would make it easy to accidentally touch that internal state
  // without going through the `#promise`, which would be unsafe.
  test('static `fromResult` constructor', async () => {
    let theResult = Result.ok<number, string>(123);
    let theTask = Task.fromResult(theResult);
    expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
    let result = await theTask;
    expect(result.isOk).toBe(true);
    expect(theTask.state).toEqual(State.Resolved);
  });

  describe('state', () => {
    test('is initially Pending', async () => {
      let { promise, resolve } = deferred<number, string>();
      let theTask = Task.try(promise);
      expect(theTask.state).toBe(State.Pending);
      // don't leak it!
      resolve(123);
      await promise;
    });

    test('is Resolved once the promise resolves', async () => {
      let { promise, resolve } = deferred<number, string>();
      let successfulTask = Task.try(promise);
      resolve(123);
      let result = await successfulTask;
      expect(successfulTask.state).toBe(State.Resolved);
      expect(unwrap(result)).toBe(123);
    });

    test('is Rejected if the promise rejects', async () => {
      let { promise, reject } = deferred<number, string>();

      let theTask = Task.try(promise);
      let anError = 'oh teh noes';
      reject(anError);

      let result = await theTask;
      expect(theTask.state).toBe(State.Rejected);
      expect(unwrapErr(result)).toEqual(anError);
    });
  });

  describe('static `from` method', () => {
    test('with a pending promise', async () => {
      let { promise, resolve } = deferred<number, never>();
      let theTask = Task.tryOrElse(promise, stringify);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
      expect(theTask.state).toBe(State.Pending);

      resolve(123);
      await promise;
    });

    test('with a resolved promise', async () => {
      let thePromise = Promise.resolve(123);
      let theTask = Task.tryOrElse(thePromise, stringify);
      await theTask;
      expect(theTask.state).toBe(State.Resolved);
    });

    test('with a rejected promise', async () => {
      let theError = 'oh teh noes';
      let thePromise = Promise.reject(theError);
      let theTask = Task.tryOrElse(thePromise, stringify);
      let theResult = await theTask;
      expectTypeOf(theResult).toEqualTypeOf<Result<never, string>>();
      expect(unwrapErr(theResult)).toEqual(stringify(theError));
    });

    test('with a `Promise<Result<T, E>>`', async () => {
      let { promise, resolve } = deferred<Result<number, string>, never>();
      let theTask = Task.unsafeTrusted(promise);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      resolve(Result.ok(123));
      let result = await theTask;
      expect(unwrap(result)).toEqual(123);
    });
  });

  describe('`map` method', () => {
    test('for a pending promise', async () => {
      let { promise, resolve } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).map((n) => n % 2 == 0);
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      resolve(123);
      await theTask;
    });

    test('when the promise resolves', async () => {
      let { promise, resolve } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).map((n) => n % 2 == 0);
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      resolve(123);
      let result = await theTask;
      expect(unwrap(result)).toBe(false);
    });

    test('when the promise rejects', async () => {
      let { promise, reject } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).map((n) => n % 2 == 0);
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      let theReason = 'nope';
      reject(theReason);
      let result = await theTask;
      expect(unwrapErr(result)).toEqual(stringify(theReason));
    });
  });

  describe('`mapRejected` method', () => {
    test('for a pending promise', async () => {
      let { promise } = deferred<number, string>();
      let theTask = Task.try(promise).mapRejected(stringify);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
    });

    test('when the promise resolves', async () => {
      let { promise, resolve } = deferred<number, string>();
      let theTask = Task.try(promise).mapRejected(stringify);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      resolve(123);
      let result = await theTask;
      expect(unwrap(result)).toBe(123);
    });

    test('when the promise rejects', async () => {
      let { promise, reject } = deferred<number, string>();
      let theTask = Task.try(promise).mapRejected(stringify);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      let theReason = 'nope';
      reject(theReason);
      let result = await theTask;
      expect(unwrapErr(result)).toEqual(stringify(theReason));
    });
  });

  describe('`and` method', () => {
    describe('when the first Task resolves', () => {
      test('when the second Task resolves', async () => {
        let theValue = 'hello';
        let theTask = Task.resolve(123).and(Task.resolve(theValue));
        expectTypeOf(theTask).toEqualTypeOf<Task<string, never>>();
        let theResult = await theTask;
        expect(unwrap(theResult)).toEqual(theValue);
      });

      test('when the second Task rejects', async () => {
        let theReason = 'hello';
        let theTask = Task.resolve<number, string>(123).and(Task.reject<number, string>(theReason));
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toEqual(theReason);
      });
    });

    describe('when the first Task rejects', () => {
      test('when the second Task resolves', async () => {
        let theReason = 123;
        let theTask = Task.reject<string, number>(theReason).and(Task.resolve<number, number>(456));
        expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toEqual(theReason);
      });

      test('when the second Task rejects', async () => {
        let theReason = 123;
        let theTask = Task.reject<string, number>(theReason).and(Task.reject<string, number>(456));
        expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toEqual(theReason);
      });
    });

    // Matches the text in the docs.
    test('all combinations', async () => {
      let resolvedA = Task.resolve<string, string>('A');
      let resolvedB = Task.resolve<string, string>('B');
      let rejectedA = Task.reject<string, string>('bad');
      let rejectedB = Task.reject<string, string>('lame');

      let aAndB = resolvedA.and(resolvedB);
      await aAndB;

      let aAndRA = resolvedA.and(rejectedA);
      await aAndRA;

      let raAndA = rejectedA.and(resolvedA);
      await raAndA;

      let raAndRb = rejectedA.and(rejectedB);
      await raAndRb;

      expect(aAndB.toString()).toEqual('Task.Resolved("B")');
      expect(aAndRA.toString()).toEqual('Task.Rejected("bad")');
      expect(raAndA.toString()).toEqual('Task.Rejected("bad")');
      expect(raAndRb.toString()).toEqual('Task.Rejected("bad")');
    });
  });

  describe('`andThen` method', () => {
    test('for a pending promise', async () => {
      let { promise, resolve } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).andThen((n) => Task.resolve(n % 2 == 0));
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      resolve(123);
      await theTask;
    });

    describe('when the first `Task` resolves', () => {
      test('when the second is pending', async () => {
        let theTask = Task.resolve<number, string>(123).andThen((n) => {
          return new Task<number, string>((resolve) => {
            resolve(Math.round(n / 2));
          });
        });

        expect(theTask.state).toBe(State.Pending);
        let theResult = await theTask;
        expect(theTask.state).toBe(State.Resolved);
        expect(unwrap(theResult)).toEqual(62);
      });

      test('when the second `Task` resolves', async () => {
        let { promise, resolve } = deferred<number, string>();
        let theTask = Task.tryOrElse(promise, stringify).andThen((n) => Task.resolve(n % 2 == 0));
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

        resolve(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(false);
      });

      test('when the second `Task` rejects', async () => {
        let { promise, resolve } = deferred<number, string>();
        let theTask = Task.tryOrElse(promise, stringify).andThen(() => Task.reject('oh no'));
        expectTypeOf(theTask).toEqualTypeOf<Task<never, string>>();

        resolve(123);
        let result = await theTask;
        expect(unwrapErr(result)).toBe('oh no');
      });
    });

    describe('when the first `Task` rejects', () => {
      test('when the second is pending', async () => {
        let theReason = 'alas!';
        let theTask = Task.reject<number, string>(theReason).andThen((n) => {
          return new Task<number, string>((resolve) => {
            resolve(Math.round(n / 2));
          });
        });

        expect(theTask.state).toBe(State.Pending);
        let theResult = await theTask;
        expect(theTask.state).toBe(State.Rejected);
        expect(unwrapErr(theResult)).toEqual(theReason);
      });

      test('when the second `Task` resolves', async () => {
        let { promise, reject } = deferred<number, string>();
        let theTask = Task.try(promise).andThen((n) => Task.resolve(n % 2 == 0));
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, unknown>>();

        let theReason = 'nope';
        reject(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });

      test('when the second `Task` rejects', async () => {
        let theReason = 'nope';
        let theTask = Task.reject<number, string>(theReason).andThen((n) =>
          Task.reject<number, string>(n % 2 == 0 ? 'yep' : 'nope')
        );
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });
    });

    describe('`or` method', () => {
      describe('when the first Task resolves', async () => {
        test('when the second is pending', async () => {
          let theFirst = Task.resolve(123);
          let theSecond = new Task<number, never>(noOp);

          let theChain = theFirst.or(theSecond);
          expect(theFirst.state).toBe(State.Resolved);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Pending);
          await theFirst;
          expect(theFirst.state).toBe(State.Resolved);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Resolved);
        });

        test('when the second Task resolves', async () => {
          let theTask = Task.resolve(123).or(Task.resolve(456));
          expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual(123);
        });

        test('when the second Task rejects', async () => {
          let theReason = 'hello';
          let theTask = Task.resolve<number, string>(123).or(
            Task.reject<number, string>(theReason)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual(123);
        });
      });

      describe('when the first Task rejects', () => {
        test('when the second is pending', async () => {
          let theFirst = Task.reject<unknown, string>('blergh');
          let theSecond = new Task<number, never>(noOp);

          let theChain = theFirst.or(theSecond);
          expect(theFirst.state).toBe(State.Rejected);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Pending);
          await theFirst;
          expect(theFirst.state).toBe(State.Rejected);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Pending);
        });

        test('when the second Task resolves', async () => {
          let theTask = Task.reject<string, number>(123).or(Task.resolve<string, number>('hello'));
          expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toBe('hello');
        });

        test('when the second Task rejects', async () => {
          let theReason = 123;
          let theTask = Task.reject<string, number>(theReason).or(Task.reject<string, number>(456));
          expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(456);
        });
      });

      // Matches the text in the docs.
      test('all combinations', async () => {
        let resolvedA = Task.resolve<string, string>('A');
        let resolvedB = Task.resolve<string, string>('B');
        let rejectedA = Task.reject<string, string>('bad');
        let rejectedB = Task.reject<string, string>('lame');

        let aOrB = resolvedA.or(resolvedB);
        await aOrB;

        let aOrRA = resolvedA.or(rejectedA);
        await aOrRA;

        let raOrA = rejectedA.or(resolvedA);
        await raOrA;

        let raOrRb = rejectedA.or(rejectedB);
        await raOrRb;

        expect(aOrB.toString()).toEqual('Task.Resolved("A")');
        expect(aOrRA.toString()).toEqual('Task.Resolved("A")');
        expect(raOrA.toString()).toEqual('Task.Resolved("A")');
        expect(raOrRb.toString()).toEqual('Task.Rejected("lame")');
      });
    });

    describe('`orElse` method', () => {
      test('for a pending promise', async () => {
        let theTask = new Task<number, string>(noOp).orElse((reason) =>
          Task.resolve(reason.length)
        );
        expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();

        expect(theTask.state).toBe(State.Pending);
      });

      describe('when the first `Task` resolves', () => {
        test('when the second is pending', async () => {
          let theFirst = Task.resolve<number, string>(123);
          let theSecond = new Task<number, boolean>(noOp);
          let theChain = theFirst.orElse(() => theSecond);

          expect(theFirst.state).toBe(State.Resolved);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Pending);
          await theFirst;
          expect(theFirst.state).toBe(State.Resolved);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Resolved);
        });

        test('when the second `Task` resolves', async () => {
          let theTask = Task.resolve<number, string>(123).orElse((reason) =>
            Task.resolve(reason.length)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();

          let result = await theTask;
          expect(unwrap(result)).toBe(123);
        });

        test('when the second `Task` rejects', async () => {
          let theTask = Task.resolve<number, string>(123).orElse((reason) =>
            Task.reject(reason.length)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();

          let result = await theTask;
          expect(unwrap(result)).toBe(123);
        });
      });

      describe('when the first `Task` rejects', () => {
        test('when the second is pending', async () => {
          let theFirst = Task.reject<number, string>('teh sads');
          let theSecond = new Task<number, boolean>(noOp);
          let theChain = theFirst.orElse(() => theSecond);

          expect(theFirst.state).toBe(State.Rejected);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Pending);
          await theFirst;
          expect(theFirst.state).toBe(State.Rejected);
          expect(theSecond.state).toBe(State.Pending);
          expect(theChain.state).toBe(State.Pending);
        });

        test('when the second `Task` resolves', async () => {
          let theTask = Task.reject<number, string>('nope').orElse((reason) =>
            Task.resolve<number, string>(reason.length)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

          let result = await theTask;
          expect(unwrap(result)).toBe(4);
        });

        test('when the second `Task` rejects', async () => {
          let theTask = Task.reject<number, string>('first error').orElse((reason) =>
            Task.reject<number, boolean>(reason.includes("'"))
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, boolean>>();

          let result = await theTask;
          expect(unwrapErr(result)).toBe(false);
        });
      });
    });

    describe('`match` method', () => {
      test('with a resolved task', async () => {
        await Task.tryOrElse(Promise.resolve(123), stringify).match({
          Resolved: (value) => expect(value).toBe(123),
          Rejected: (_reason) => expect.unreachable(),
        });
        expect.assertions(1);
      });

      test('with a rejected task', async () => {
        await Task.tryOrElse(Promise.reject(123), stringify).match({
          Resolved: (_value) => expect.unreachable(),
          Rejected: (reason) => expect(reason).toEqual(stringify(123)),
        });
        expect.assertions(1);
      });

      test('with a pending task', () => {
        // Will never resolve, but should be collected at the end of the test.
        // Note that this test passes when, and only when, no test assertions
        // run at all.
        let task = new Task(() => {});
        task.match({
          Resolved: () => expect.unreachable(),
          Rejected: () => expect.unreachable(),
        });
        expect.assertions(0);
      });
    });

    describe('`value` accessor', () => {
      test('when the task is pending', () => {
        let theTask = new Task(noOp);

        expectTypeOf(theTask).not.toHaveProperty('value');
        expectTypeOf(theTask).not.toHaveProperty('reason');

        expect(() => (theTask as unknown as Resolved<unknown, unknown>).value).toThrowError(
          InvalidAccess
        );
      });

      test('when the task is resolved', () => {
        let theValue = 123;
        let theTask = Task.resolve(theValue);
        if (theTask.isResolved) {
          expectTypeOf(theTask).toHaveProperty('value');
          expectTypeOf(theTask).not.toHaveProperty('reason');
          expect(theTask.value).toBe(theValue);
        } else {
          expect.unreachable();
        }
      });

      test('when the task is rejected', () => {
        let theTask = Task.reject('oh teh noes');
        expect(() => (theTask as unknown as Resolved<unknown, unknown>).value).toThrowError(
          InvalidAccess
        );
      });
    });

    describe('`reason` accessor', () => {
      test('when the task is pending', () => {
        let theTask = new Task(noOp);
        expectTypeOf(theTask).not.toHaveProperty('value');
        expectTypeOf(theTask).not.toHaveProperty('reason');
        expect(() => (theTask as unknown as Rejected<unknown, unknown>).reason).toThrowError(
          InvalidAccess
        );
      });

      test('when the task is resolved', () => {
        let theTask = Task.resolve(123);
        expect(() => (theTask as unknown as Rejected<unknown, unknown>).reason).toThrowError(
          InvalidAccess
        );
      });

      test('when the task is rejected', () => {
        let theReason = 'oh teh noes';
        let theTask = Task.reject(theReason);
        if (theTask.isRejected) {
          expectTypeOf(theTask).not.toHaveProperty('value');
          expectTypeOf(theTask).toHaveProperty('reason');
          expect(theTask.reason).toBe(theReason);
        } else {
          expect.unreachable();
        }
      });
    });
  });

  describe('toString', () => {
    expectTypeOf(Task['toString']).toEqualTypeOf<() => string>();

    test('pending', async () => {
      let { task, resolve } = Task.withResolvers();
      expect(task.toString()).toEqual('Task.Pending');

      resolve('');
      await task;
    });

    test('resolved', async () => {
      let theTask = new Task((resolve) => resolve(123));
      await theTask;
      expect(theTask.toString()).toEqual('Task.Resolved(123)');
    });

    test('rejected', async () => {
      let theTask = new Task((_, reject) => reject('teh sads'));
      await theTask;
      expect(theTask.toString()).toEqual('Task.Rejected("teh sads")');
    });
  });

  describe('`toPromise` method', () => {
    test('with a directly-constructed task', async () => {
      let { task, resolve } = Task.withResolvers();
      let promise = task.toPromise();

      let theValue = 'hello';
      resolve(theValue);
      let output = await promise;
      expect(unwrap(output)).toEqual(theValue);
    });

    test('with a passed-in-promise', async () => {
      let { promise: theInputPromise, resolve } = deferred();
      let theTask = Task.try(theInputPromise);

      let theValue = 123;
      resolve(theValue);
      let theResult = await theTask.toPromise();
      expect(unwrap(theResult)).toEqual(theValue);
    });
  });
});

describe('narrowing', () => {
  test('pending', async () => {
    let { promise, resolve } = deferred<number, string>();
    let theTask = Task.try(promise);

    if (theTask.state === State.Pending) {
      expect(theTask.isPending).toBe(true);
      expect(theTask.isResolved).toBe(false);
      expect(theTask.isRejected).toBe(false);
    }

    resolve(123);
    await theTask;
  });

  test('resolved', async () => {
    let { promise, resolve } = deferred<number, string>();
    let theTask = Task.try(promise);

    resolve(123);
    await theTask;

    if (theTask.state === State.Resolved) {
      expect(theTask.value).toBe(123);
      expect(theTask.isPending).toBe(false);
      expect(theTask.isResolved).toBe(true);
      expect(theTask.isRejected).toBe(false);
    }
  });

  test('rejected', async () => {
    let { promise, reject } = deferred<number, string>();
    let theTask = Task.tryOrElse(promise, (e) => `${e}`);

    let theError = 'oh teh noes';
    reject(theError);
    await theTask;

    if (theTask.state === State.Rejected) {
      expect(theTask.reason).toBe(theError);
      expect(theTask.isPending).toBe(false);
      expect(theTask.isResolved).toBe(false);
      expect(theTask.isRejected).toBe(true);
    }
  });
});

// Supports our current targets (which do not include `Promise.withResolvers`).
function deferred<T, E>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: E) => void;
} {
  // SAFETY: immediately resolved via promise constructor
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  let promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function stringify(reason: unknown): string {
  return JSON.stringify(reason, null, 2);
}

function noOp() {}
