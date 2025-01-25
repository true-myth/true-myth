import { afterEach, assert, beforeEach, describe, expect, expectTypeOf, test } from 'vitest';

import Task, {
  InvalidAccess,
  Rejected,
  Resolved,
  State,
  TaskExecutorException,
  UnsafePromise,
  all,
  allSettled,
  any,
  timer,
  race,
  Settled,
  AggregateRejection,
  Timer,
  safelyTry,
  safelyTryOr,
  safelyTryOrElse,
  safe,
  safeNullable,
  fromPromise,
  fromUnsafePromise,
  fromResult,
  resolve,
  reject,
  withResolvers,
  orElse,
  match,
  or,
  andThen,
  and,
  mapRejected,
  map,
  timeout,
  Timeout,
  toPromise,
  withRetries,
  stopRetrying,
  isRetryFailed,
} from 'true-myth/task';
import {
  exponential,
  fibonacci,
  fixed,
  immediate,
  jitter,
  linear,
  none,
} from 'true-myth/task/delay';
import Maybe from 'true-myth/maybe';
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

    describe('`fromUnsafePromise`', () => {
      test('when the task resolves', async () => {
        let { promise, resolve } = deferred<Result<number, string>, never>();
        let theTask = Task.fromUnsafePromise(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theInputResult = Result.ok<number, string>(123);
        resolve(theInputResult);
        let theResultingResult = await theTask;
        expect(theResultingResult).toEqual(Result.ok(123));
        expectTypeOf(theResultingResult).toEqualTypeOf(theInputResult);
      });

      test('with a `Promise<Result<T, E>>`', async () => {
        let { promise, resolve } = deferred<Result<number, string>, never>();
        let theTask = Task.fromUnsafePromise(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolve(Result.ok(123));
        let result = await theTask;
        expect(unwrap(result)).toEqual(123);
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
        let theTask = Task.fromUnsafePromise(promise);
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

      test('when the task resolves', async () => {
        let { promise, resolve } = deferred<number, never>();
        let theTask = Task.tryOrElse(promise, stringify);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolve(123);
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrap(result)).toBe(123);
      });

      test('with a rejected promise', async () => {
        let theError = 'oh teh noes';
        let thePromise = Promise.reject(theError);
        let theTask = Task.tryOrElse(thePromise, stringify);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<never, string>>();
        expect(unwrapErr(theResult)).toEqual(stringify(theError));
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

    describe('`resolve`', () => {
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

    describe('`reject`', () => {
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
    test('`fromResult`', async () => {
      let theResult = Result.ok<number, string>(123);
      let theTask = Task.fromResult(theResult);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
      let result = await theTask;
      expect(result.isOk).toBe(true);
      expect(theTask.state).toEqual(State.Resolved);
    });
  });

  describe('instance methods', () => {
    describe('`map`', () => {
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

    describe('`mapRejected`', () => {
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

    describe('`and`', () => {
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
          let theTask = Task.resolve<number, string>(123).and(
            Task.reject<number, string>(theReason)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });
      });

      describe('when the first Task rejects', () => {
        test('when the second Task resolves', async () => {
          let theReason = 123;
          let theTask = Task.reject<string, number>(theReason).and(
            Task.resolve<number, number>(456)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });

        test('when the second Task rejects', async () => {
          let theReason = 123;
          let theTask = Task.reject<string, number>(theReason).and(
            Task.reject<string, number>(456)
          );
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

    describe('`andThen`', () => {
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
    });

    describe('`or`', () => {
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

    describe('`orElse`', () => {
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

    describe('`match`', () => {
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

    describe('`toPromise`', () => {
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

    describe('`timeout`', () => {
      describe('with a number', () => {
        test('that is shorter', async () => {
          // shorter by dint of "literally any timeout is shorter than never".
          let { task } = Task.withResolvers<string, never>();
          let result = await task.timeout(1);
          expect(result.isErr).toBe(true);
          if (result.isErr) {
            expect(result.error.duration).toBe(1);
          } else {
            expect.unreachable();
          }
        });

        test('that is equal', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration)).timeout(
            duration
          );
          let result = await task;
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });

        test('that is longer', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration)).timeout(
            duration * 2
          );
          let result = await task;
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });
      });

      describe('with another timer', () => {
        test('that is shorter', async () => {
          // shorter by dint of "literally any timeout is shorter than never".
          let { task } = Task.withResolvers<string, never>();
          let result = await task.timeout(timer(1));
          expect(result.isErr).toBe(true);
          if (result.isErr) {
            expect(result.error.duration).toBe(1);
          } else {
            expect.unreachable();
          }
        });

        test('that is equal', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration)).timeout(
            timer(duration)
          );
          let result = await task;
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });

        test('that is longer', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration)).timeout(
            timer(duration * 2)
          );
          let result = await task;
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });
      });
    });
  });

  describe('accessors', () => {
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

    describe('`value`', () => {
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

    describe('`reason`', () => {
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
});

describe('module-scope functions', () => {
  describe('all', () => {
    describe('with a single task', () => {
      test('that is still pending', () => {
        let { task } = Task.withResolvers<string, number>();
        let result = all([task] as const);
        expectTypeOf(result).toEqualTypeOf<Task<Array<string>, number>>();
        expect(result.state).toBe(State.Pending);
      });

      test('that has resolved', async () => {
        let theTask = Task.resolve('hello');
        let result = all([theTask]);
        expectTypeOf(result).toEqualTypeOf<Task<string[], never>>();
        await result;
        expect(result.state).toBe(State.Resolved);
        if (result.isResolved) {
          expect(result.value).toEqual(['hello']);
        }
      });

      test('that has rejected', async () => {
        let theReason = 'oops';
        let theTask = Task.reject<string, string>(theReason);
        let result = all([theTask]);
        await result;
        expectTypeOf(result).toEqualTypeOf<Task<string[], string>>();
        expect(result.state).toBe(State.Rejected);
        if (result.isRejected) {
          expect(result.reason).toBe(theReason);
        }
      });
    });

    describe('with two tasks', () => {
      test('types', () => {
        let { task: task1 } = Task.withResolvers<string, number>();
        let { task: task2 } = Task.withResolvers<boolean, Error>();
        let fromTuple = all([task1, task2] as const);
        let fromArray = all([task1, task2]);
        expectTypeOf(fromTuple).toEqualTypeOf(fromArray);
      });

      test('that are all still pending', () => {
        let { task: task1 } = Task.withResolvers<string, number>();
        let { task: task2 } = Task.withResolvers<boolean, Error>();
        let result = all([task1, task2] as const);
        expectTypeOf(result).toEqualTypeOf<Task<Array<string | boolean>, number | Error>>();
        expect(result.state).toBe(State.Pending);
      });

      describe('when the first resolves', () => {
        test('while the second is pending', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2 } = Task.withResolvers<number, boolean>();
          let result = all([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<Task<Array<string | number>, number | boolean>>();

          resolve1('first');
          expect(result.state).toBe(State.Pending);
        });

        test('when the second has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = all([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<Task<Array<number | string>, string | boolean>>();

          resolve2('second');
          resolve1(1);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toEqual(['second', 1]);
          }
        });

        test('when the second has rejected', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, reject: reject2 } = Task.withResolvers<boolean, string>();
          let result = all([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<Task<Array<string | boolean>, number | string>>();

          reject2('error');
          resolve1('first');
          await result;
          expect(result.state).toBe(State.Rejected);
          if (result.isRejected) {
            expect(result.reason).toBe('error');
          }
        });
      });

      describe('when the second resolves', () => {
        test('while the first is pending', async () => {
          let { task: task1 } = Task.withResolvers<number, boolean>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, Error>();
          let result = all([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<Task<Array<number | string>, boolean | Error>>();

          resolve2('second');
          expect(result.state).toBe(State.Pending);
        });

        test('when the first has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<number, boolean>();
          let result = all([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<Task<Array<string | number>, number | boolean>>();

          resolve1('first');
          resolve2(2);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toEqual(['first', 2]);
          }
        });

        test('when the first has rejected', async () => {
          let { task: task1, reject: reject1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = all([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<Task<Array<number | string>, string | boolean>>();

          reject1('error');
          resolve2('second');
          await result;
          expect(result.state).toBe(State.Rejected);
          if (result.isRejected) {
            expect(result.reason).toBe('error');
          }
        });
      });
    });

    test('rejection happens immediately', async () => {
      let { task: task1, reject: reject1 } = Task.withResolvers<number, string>();
      let { task: task2 } = Task.withResolvers<string, boolean>();
      let result = all([task1, task2] as const);
      expectTypeOf(result).toEqualTypeOf<Task<Array<number | string>, string | boolean>>();

      reject1('error');
      await result;
      expect(result.state).toBe(State.Rejected);
      if (result.isRejected) {
        expect(result.reason).toBe('error');
      }
    });

    // Covers the early return path when a second rejection triggers.
    test('multiple rejections', async () => {
      let result = all([Task.reject('first'), Task.reject('second')]);
      await result;
      if (result.isRejected) {
        expect(result.reason).toBe('first');
      } else {
        expect.unreachable();
      }
    });

    test('with an empty set of tasks', async () => {
      let noTasks = all([]);
      expectTypeOf(noTasks).toEqualTypeOf<Task<[], never>>();
      await noTasks;
      expect(noTasks.state).toBe(State.Resolved);
      if (noTasks.isResolved) {
        expect(noTasks.value).toEqual([]);
      }
    });

    test('with multiple tasks (integration)', async () => {
      let { task: willReject, reject } = Task.withResolvers();

      let allTasks = all([timer(10), timer(20), willReject]);

      let theReason = 'something went wrong';
      reject(theReason);
      let result = await allTasks;
      expect(allTasks.state).toBe(State.Rejected);
      if (allTasks.isRejected) {
        expect(allTasks.reason).toBe(theReason);
      }

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBe(theReason);
      } else {
        expect.unreachable();
      }
    });
  });

  describe('allSettled', () => {
    describe('with a single task', () => {
      test('that is still pending', () => {
        let { task } = Task.withResolvers<string, number>();
        let result = allSettled([task] as const);
        expectTypeOf(result).toEqualTypeOf<Task<[Result<string, number>], never>>();
        expect(result.state).toBe(State.Pending);
      });

      test('that has resolved', async () => {
        let theTask = Task.resolve('hello');
        let result = allSettled([theTask]);
        expectTypeOf(result).toEqualTypeOf<Task<Array<Result<string, never>>, never>>();
        await result;
        expect(result.state).toBe(State.Resolved);
        if (result.isResolved) {
          expect(result.value[0]!.isOk).toBe(true);
          expect(unwrap(result.value[0]!)).toBe('hello');
        }
      });

      test('that has rejected', async () => {
        let theReason = 'oops';
        let theTask = Task.reject<string, string>(theReason);
        let result = allSettled([theTask] as const);
        await result;
        expectTypeOf(result).toEqualTypeOf<Task<[Result<string, string>], never>>();
        expect(result.state).toBe(State.Resolved);
        if (result.isResolved) {
          expect(result.value[0].isErr).toBe(true);
          expect(unwrapErr(result.value[0])).toBe(theReason);
        }
      });
    });

    describe('with two tasks', () => {
      test('that are all still pending', () => {
        let { task: task1 } = Task.withResolvers<string, number>();
        let { task: task2 } = Task.withResolvers<boolean, Error>();
        let result = allSettled([task1, task2] as const);
        expectTypeOf(result).toEqualTypeOf<
          Task<[Result<string, number>, Result<boolean, Error>], never>
        >();
        expect(result.state).toBe(State.Pending);
      });

      describe('when the first resolves', () => {
        test('while the second is pending', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2 } = Task.withResolvers<number, boolean>();
          let result = allSettled([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<
            Task<[Result<string, number>, Result<number, boolean>], never>
          >();

          resolve1('first');
          expect(result.state).toBe(State.Pending);
        });

        test('when the second has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = allSettled([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<
            Task<[Result<number, string>, Result<string, boolean>], never>
          >();

          resolve2('second');
          resolve1(1);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value[0].isOk).toBe(true);
            expect(result.value[1].isOk).toBe(true);
            expect(unwrap(result.value[0])).toBe(1);
            expect(unwrap(result.value[1])).toBe('second');
          }
        });

        test('when the second has rejected', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, reject: reject2 } = Task.withResolvers<boolean, string>();
          let result = allSettled([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<
            Task<[Result<string, number>, Result<boolean, string>], never>
          >();

          reject2('error');
          resolve1('first');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value[0].isOk).toBe(true);
            expect(result.value[1].isErr).toBe(true);
            expect(unwrap(result.value[0])).toBe('first');
            expect(unwrapErr(result.value[1])).toBe('error');
          }
        });
      });

      describe('when the second resolves', () => {
        test('while the first is pending', async () => {
          let { task: task1 } = Task.withResolvers<number, boolean>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, Error>();
          let result = allSettled([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<
            Task<[Result<number, boolean>, Result<string, Error>], never>
          >();

          resolve2('second');
          expect(result.state).toBe(State.Pending);
        });

        test('when the first has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<number, boolean>();
          let result = allSettled([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<
            Task<[Result<string, number>, Result<number, boolean>], never>
          >();

          resolve1('first');
          resolve2(2);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value[0].isOk).toBe(true);
            expect(result.value[1].isOk).toBe(true);
            expect(unwrap(result.value[0])).toBe('first');
            expect(unwrap(result.value[1])).toBe(2);
          }
        });

        test('when the first has rejected', async () => {
          let { task: task1, reject: reject1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = allSettled([task1, task2] as const);
          expectTypeOf(result).toEqualTypeOf<
            Task<[Result<number, string>, Result<string, boolean>], never>
          >();

          reject1('error');
          resolve2('second');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value[0].isErr).toBe(true);
            expect(result.value[1].isOk).toBe(true);
            expect(unwrapErr(result.value[0])).toBe('error');
            expect(unwrap(result.value[1])).toBe('second');
          }
        });
      });
    });
  });

  describe('any', () => {
    test('with an empty array', async () => {
      let result = any([]);
      expectTypeOf(result).toEqualTypeOf<Task<never, AggregateRejection<[]>>>();
      await result;
      expect(result.state).toBe(State.Rejected);
      if (result.isRejected) {
        expect(result.reason).toBeInstanceOf(AggregateRejection);
        expect(result.reason.errors.length).toBe(0);
        expect(result.reason.toString()).toMatch('No tasks');
      }
    });

    describe('with a single task', () => {
      test('that is still pending', () => {
        let { task } = Task.withResolvers();
        let result = any([task]);
        expect(result.state).toBe(State.Pending);
      });

      test('that has resolved', async () => {
        let theTask = Task.resolve('hello');
        let result = any([theTask]);
        await result;
        expect(result.state).toBe(State.Resolved);
        if (result.isResolved) {
          expect(result.value).toBe('hello');
        }
      });

      test('that has rejected', async () => {
        let theReason = 'oops';
        let theTask = Task.reject<string, string>(theReason);
        let result = any([theTask]);
        await result;
        expect(result.state).toBe(State.Rejected);
        if (result.isRejected) {
          expect(result.reason.errors[0]).toBe(theReason);
          expect(result.reason.toString()).toMatch('[oops]');
        }
      });
    });

    describe('with two tasks', () => {
      test('that are all still pending', () => {
        let { task: task1 } = Task.withResolvers();
        let { task: task2 } = Task.withResolvers();
        let result = any([task1, task2]);
        expect(result.state).toBe(State.Pending);
      });

      describe('when the first resolves', () => {
        test('while the second is pending', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2 } = Task.withResolvers<number, boolean>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<string | number, AggregateRejection<Array<number | boolean>>>
          >();

          resolve1('first');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('first');
          }
        });

        test('when the second has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<number | string, AggregateRejection<Array<string | boolean>>>
          >();

          resolve2('second');
          resolve1(1);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('second');
          }
        });

        test('when the second has rejected', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, reject: reject2 } = Task.withResolvers<boolean, string>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<string | boolean, AggregateRejection<Array<number | string>>>
          >();

          reject2('error');
          resolve1('first');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('first');
          }
        });
      });

      describe('when the first rejects', () => {
        test('while the second is pending', async () => {
          let { task: task1, reject: reject1 } = Task.withResolvers<string, number>();
          let { task: task2 } = Task.withResolvers<number, boolean>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<string | number, AggregateRejection<Array<number | boolean>>>
          >();

          reject1(1);
          expect(result.state).toBe(State.Pending);
        });

        test('when the second has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<number | string, AggregateRejection<Array<string | boolean>>>
          >();

          resolve2('second');
          resolve1(1);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('second');
          }
        });

        test('when the second has also rejected', async () => {
          let { task: task1, reject: reject1 } = Task.withResolvers<string, number>();
          let { task: task2, reject: reject2 } = Task.withResolvers<boolean, string>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<string | boolean, AggregateRejection<Array<number | string>>>
          >();

          reject2('error');
          reject1(1);
          await result;
          expect(result.state).toBe(State.Rejected);
          if (result.isRejected) {
            expect(result.reason).toBeInstanceOf(AggregateRejection);
            expect(result.reason.errors[0]!).toBe('error');
            expect(result.reason.errors[1]!).toBe(1);
          }
        });
      });

      describe('when the second resolves', () => {
        test('while the first is pending', async () => {
          let { task: task1 } = Task.withResolvers<number, boolean>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, Error>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<number | string, AggregateRejection<Array<boolean | Error>>>
          >();

          resolve2('second');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('second');
          }
        });

        test('when the first has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<number, boolean>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<string | number, AggregateRejection<Array<number | boolean>>>
          >();

          resolve1('first');
          resolve2(2);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('first');
          }
        });

        test('when the first has rejected', async () => {
          let { task: task1, reject: reject1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = any([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<
            Task<number | string, AggregateRejection<Array<string | boolean>>>
          >();

          reject1('error');
          resolve2('second');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('second');
          }
        });
      });
    });

    describe('when the second rejects', () => {
      test('while the first is pending', async () => {
        let { task: task1 } = Task.withResolvers<number, boolean>();
        let { task: task2, reject: reject2 } = Task.withResolvers<string, number>();
        let result = any([task1, task2]);
        expectTypeOf(result).toEqualTypeOf<
          Task<number | string, AggregateRejection<Array<boolean | number>>>
        >();

        reject2(2);
        expect(result.state).toBe(State.Pending);
      });

      test('when the first has already resolved', async () => {
        let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
        let { task: task2, reject: reject2 } = Task.withResolvers<number, boolean>();
        let result = any([task1, task2]);
        expectTypeOf(result).toEqualTypeOf<
          Task<string | number, AggregateRejection<Array<number | boolean>>>
        >();

        resolve1('first');
        reject2(true);
        await result;
        expect(result.state).toBe(State.Resolved);
        if (result.isResolved) {
          expect(result.value).toBe('first');
        }
      });

      test('when the first has also rejected', async () => {
        let { task: task1, reject: reject1 } = Task.withResolvers<number, string>();
        let { task: task2, reject: reject2 } = Task.withResolvers<string, boolean>();
        let result = any([task1, task2] as const);
        expectTypeOf(result).toEqualTypeOf<
          Task<number | string, AggregateRejection<Array<string | boolean>>>
        >();

        reject1('error');
        reject2(true);
        await result;
        expect(result.state).toBe(State.Rejected);
        if (result.isRejected) {
          expect(result.reason).toBeInstanceOf(AggregateRejection);
          expect(result.reason.errors.length).toBe(2);
          expect(result.reason.errors[0]).toBe('error');
          expect(result.reason.errors[1]).toBe(true);
        }
      });
    });
  });

  describe('race', () => {
    expectTypeOf(race([Task.resolve('hello'), Task.resolve(123)] as const)).toEqualTypeOf(
      race([Task.resolve('hello'), Task.resolve(123)])
    );

    test('with an empty array', () => {
      // Note: this will *never* resolve, so do not attempt to await it!
      let result = race([]);
      expectTypeOf(result).toEqualTypeOf<Task<never, never>>();
      expect(result.state).toBe(State.Pending);
    });

    describe('with a single task', () => {
      test('that is still pending', () => {
        let { task } = Task.withResolvers<string, number>();
        let result = race([task]);
        expectTypeOf(result).toEqualTypeOf<Task<string, number>>();
        expect(result.state).toBe(State.Pending);
      });

      test('that has resolved', async () => {
        let theTask = Task.resolve('hello');
        let result = race([theTask]);
        expectTypeOf(result).toEqualTypeOf<Task<string, never>>();
        await result;
        expect(result.state).toBe(State.Resolved);
        if (result.isResolved) {
          expect(result.value).toBe('hello');
        }
      });

      test('that has rejected', async () => {
        let theReason = 'oops';
        let theTask = Task.reject<string, string>(theReason);
        let result = race([theTask]);
        await result;
        expectTypeOf(result).toEqualTypeOf<Task<string, string>>();
        expect(result.state).toBe(State.Rejected);
        if (result.isRejected) {
          expect(result.reason).toBe(theReason);
        }
      });
    });

    describe('with two tasks', () => {
      test('that are all still pending', () => {
        let { task: task1 } = Task.withResolvers<string, number>();
        let { task: task2 } = Task.withResolvers<boolean, Error>();
        let result = race([task1, task2]);
        expectTypeOf(result).toEqualTypeOf<Task<string | boolean, number | Error>>();
        expect(result.state).toBe(State.Pending);
      });

      describe('when the first resolves', () => {
        test('while the second is pending', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2 } = Task.withResolvers<number, boolean>();
          let result = race([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<Task<string | number, number | boolean>>();

          resolve1('first');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('first');
          }
        });

        test('when the second has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = race([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<Task<number | string, string | boolean>>();

          resolve2('second');
          resolve1(1);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('second');
          }
        });

        test('when the second has rejected', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, reject: reject2 } = Task.withResolvers<boolean, string>();
          let result = race([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<Task<string | boolean, number | string>>();

          reject2('error');
          resolve1('first');
          await result;
          expect(result.state).toBe(State.Rejected);
          if (result.isRejected) {
            expect(result.reason).toBe('error');
          }
        });
      });

      describe('when the second resolves', () => {
        test('while the first is pending', async () => {
          let { task: task1 } = Task.withResolvers<number, boolean>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, Error>();
          let result = race([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<Task<number | string, boolean | Error>>();

          resolve2('second');
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('second');
          }
        });

        test('when the first has already resolved', async () => {
          let { task: task1, resolve: resolve1 } = Task.withResolvers<string, number>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<number, boolean>();
          let result = race([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<Task<string | number, number | boolean>>();

          resolve1('first');
          resolve2(2);
          await result;
          expect(result.state).toBe(State.Resolved);
          if (result.isResolved) {
            expect(result.value).toBe('first');
          }
        });

        test('when the first has rejected', async () => {
          let { task: task1, reject: reject1 } = Task.withResolvers<number, string>();
          let { task: task2, resolve: resolve2 } = Task.withResolvers<string, boolean>();
          let result = race([task1, task2]);
          expectTypeOf(result).toEqualTypeOf<Task<number | string, string | boolean>>();

          reject1('error');
          resolve2('second');
          await result;
          expect(result.state).toBe(State.Rejected);
          if (result.isRejected) {
            expect(result.reason).toBe('error');
          }
        });
      });
    });
  });

  test('timer', async () => {
    let ms = 1;
    let aTimer = timer(ms);
    expectTypeOf(aTimer).toEqualTypeOf<Timer>();
    let result = await aTimer;
    expect(unwrap(result)).toEqual(ms);
  });

  describe('resolve', () => {
    test('produces `Task<Unit, never>` when passed no arguments', () => {
      let theTask = resolve();
      expectTypeOf(theTask).toEqualTypeOf<Task<Unit, never>>();
    });

    test('produces `Task<T, never>` when passed a basic argument', () => {
      let theValue = 'hello';
      let theTask = resolve(theValue);
      expectTypeOf(theTask).toEqualTypeOf<Task<string, never>>();
    });

    test('allows explicitly setting a type for `E`', () => {
      let resolvedWithUnit = resolve<Unit, string>();
      expectTypeOf(resolvedWithUnit).toEqualTypeOf<Task<Unit, string>>();

      let resolvedWithValue = resolve<string, number>('hello');
      expectTypeOf(resolvedWithValue).toEqualTypeOf<Task<string, number>>();
    });
  });

  describe('reject', () => {
    test('produces `Task<never, Unit>` when passed no arguments', () => {
      let theTask = reject();
      expectTypeOf(theTask).toEqualTypeOf<Task<never, Unit>>();
    });

    test('produces `Task<never, E>` when passed an argument', () => {
      let theReason = 'uh oh';
      let theTask = reject(theReason);
      expectTypeOf(theTask).toEqualTypeOf<Task<never, string>>();
    });

    test('allows explicitly setting a type for `T`', () => {
      let rejectedWithUnit = reject<string>();
      expectTypeOf(rejectedWithUnit).toEqualTypeOf<Task<string, Unit>>();

      let rejectedWithValue = reject<string, number>(123);
      expectTypeOf(rejectedWithValue).toEqualTypeOf<Task<string, number>>();
    });
  });

  describe('withResolvers', () => {
    test('supports resolving', async () => {
      let { task, resolve } = withResolvers<string, never>();
      expectTypeOf(task).toEqualTypeOf<Task<string, never>>();

      let theValue = 'hello';
      resolve(theValue);
      let result = await task;
      expect(unwrap(result)).toEqual(theValue);
    });

    test('supports rejecting', async () => {
      let { task, reject } = withResolvers<never, string>();
      expectTypeOf(task).toEqualTypeOf<Task<never, string>>();

      let theReason = 'le sigh';
      reject(theReason);
      let result = await task;
      expect(unwrapErr(result)).toEqual(theReason);
    });
  });

  describe('safelyTry', () => {
    describe('with a non-throwing function', () => {
      test('with a promise that resolves', async () => {
        let theTask = safelyTry(() => Promise.resolve(123));
        expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();
        let theResult = await theTask;
        expect(unwrap(theResult)).toBe(123);
      });

      test('with a promise that rejects', async () => {
        let theTask = safelyTry(() => Promise.reject(123));
        expectTypeOf(theTask).toEqualTypeOf<Task<never, unknown>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toBe(123);
      });
    });

    describe('with a throwing function', () => {
      test('with a promise that resolves', async () => {
        let theTask = safelyTry((): Promise<number> => {
          throw new Error('NOPE');
          return Promise.resolve(123);
        });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();
        let theResult = await theTask;
        let theError = unwrapErr(theResult);
        expect(theError).toBeInstanceOf(Error);
        expect((theError as Error).message).toBe('NOPE');
      });

      test('with a promise that rejects', async () => {
        let theTask = safelyTry((): Promise<number> => {
          throw new Error('NOPE');
          return Promise.reject(123);
        });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();
        let theResult = await theTask;
        let theError = unwrapErr(theResult);
        expect(theError).toBeInstanceOf(Error);
        expect((theError as Error).message).toBe('NOPE');
      });
    });
  });

  describe('safelyTryOr', () => {
    describe('with a non-throwing function', () => {
      test('with a promise that resolves', async () => {
        let theTask = safelyTryOr('error', () => Promise.resolve(123));
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        expect(unwrap(theResult)).toBe(123);
      });

      test('with a promise that rejects', async () => {
        let theTask = safelyTryOr('error', () => Promise.reject(123));
        expectTypeOf(theTask).toEqualTypeOf<Task<never, string>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toBe('error');
      });
    });

    describe('with a throwing function', () => {
      test('with a promise that resolves', async () => {
        let theTask = safelyTryOr('error', (): Promise<number> => {
          throw new Error('NOPE');
          return Promise.resolve(123);
        });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toBe('error');
      });

      test('with a promise that rejects', async () => {
        let theTask = safelyTryOr('error', (): Promise<number> => {
          throw new Error('NOPE');
          return Promise.reject(123);
        });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toBe('error');
      });
    });
  });

  describe('safelyTryOrElse', () => {
    describe('with a non-throwing function', () => {
      test('with a promise that resolves', async () => {
        let theTask = safelyTryOrElse(stringify, () => Promise.resolve(123));
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        expect(unwrap(theResult)).toBe(123);
      });

      test('with a promise that rejects', async () => {
        let theTask = safelyTryOrElse(stringify, () => Promise.reject(123));
        expectTypeOf(theTask).toEqualTypeOf<Task<never, string>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toBe(stringify(123));
      });
    });

    describe('with a throwing function', () => {
      test('with a promise that resolves', async () => {
        let theTask = safelyTryOrElse(stringify, (): Promise<number> => {
          throw new Error('NOPE');
          return Promise.resolve(123);
        });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        let theError = unwrapErr(theResult);
        expect(theError).toBe(stringify(new Error('NOPE')));
      });

      test('with a promise that rejects', async () => {
        let theTask = safelyTryOrElse(stringify, (): Promise<number> => {
          throw new Error('NOPE');
          return Promise.reject(123);
        });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        let theError = unwrapErr(theResult);
        expect(theError).toBe(stringify(new Error('NOPE')));
      });
    });
  });

  describe('safe', () => {
    const ERROR_MESSAGE = 'the message';
    const REJECTION_REASON = 'ugh';

    function example(
      value: number,
      {
        throwErr = false,
        rejectPromise = false,
      }: { throwErr?: boolean; rejectPromise?: boolean } = {
        throwErr: false,
        rejectPromise: false,
      }
    ): Promise<number> {
      if (throwErr) {
        throw new Error(ERROR_MESSAGE);
      }

      return rejectPromise ? Promise.reject(REJECTION_REASON) : Promise.resolve(value);
    }

    describe('without an error handler', () => {
      let safeExample = safe(example);
      expectTypeOf(safeExample).toEqualTypeOf<
        (
          value: number,
          should?: { throwErr?: boolean; rejectPromise?: boolean }
        ) => Task<number, unknown>
      >();

      test('when it throws', async () => {
        let theTask = safeExample(123, { throwErr: true });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();
        await theTask;
        if (theTask.isRejected) {
          expect((theTask.reason as Error).message).toMatch(ERROR_MESSAGE);
        }
      });

      describe('when it does not throw', () => {
        test('and it resolves', async () => {
          let theTask = safeExample(123);
          expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();
          await theTask;
          console.log(theTask.toString());
          if (theTask.isResolved) {
            expect(theTask.value).toBe(123);
          } else {
            expect.unreachable();
          }
        });

        test('and it rejects', async () => {
          let theTask = safeExample(123, { rejectPromise: true });
          expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();
          await theTask;
          console.log(theTask.toString());
          if (theTask.isRejected) {
            expect(theTask.reason).toBe(REJECTION_REASON);
          } else {
            expect.unreachable();
          }
        });
      });
    });

    describe('with an error handler', () => {
      let safeExample = safe(example, stringify);
      expectTypeOf(safeExample).toEqualTypeOf<
        (
          value: number,
          should?: { throwErr?: boolean; rejectPromise?: boolean }
        ) => Task<number, string>
      >();

      test('when it throws', async () => {
        let theTask = safeExample(123, { throwErr: true });
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        await theTask;
        if (theTask.isRejected) {
          expect(theTask.reason).toBe('{}'); // Errors stringify weirdly
        }
      });

      describe('when it does not throw', () => {
        test('and it resolves', async () => {
          let theTask = safeExample(123);
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          await theTask;
          console.log(theTask.toString());
          if (theTask.isResolved) {
            expect(theTask.value).toBe(123);
          } else {
            expect.unreachable();
          }
        });

        test('and it rejects', async () => {
          let theTask = safeExample(123, { rejectPromise: true });
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          await theTask;
          if (theTask.isRejected) {
            expect(theTask.reason).toBe(`"${REJECTION_REASON}"`);
          } else {
            expect.unreachable();
          }
        });
      });
    });
  });

  describe('safeNullable', () => {
    const ERROR_MESSAGE = 'the message';
    const REJECTION_REASON = 'ugh';

    function example(
      value: number,
      {
        throwErr = false,
        rejectPromise = false,
        returnNull = false,
      }: { throwErr?: boolean; rejectPromise?: boolean; returnNull?: boolean } = {
        throwErr: false,
        rejectPromise: false,
        returnNull: false,
      }
    ): Promise<number | null> {
      if (throwErr) {
        throw new Error(ERROR_MESSAGE);
      }

      if (returnNull) {
        return Promise.resolve(null);
      }

      return rejectPromise ? Promise.reject(REJECTION_REASON) : Promise.resolve(value);
    }

    describe('without an error handler', () => {
      let safeExample = safeNullable(example);
      expectTypeOf(safeExample).toEqualTypeOf<
        (
          value: number,
          should?: { throwErr?: boolean; rejectPromise?: boolean; returnNull?: boolean }
        ) => Task<Maybe<number>, unknown>
      >();

      test('when it throws', async () => {
        let theTask = safeExample(123, { throwErr: true });
        expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, unknown>>();
        await theTask;
        if (theTask.isRejected) {
          expect((theTask.reason as Error).message).toMatch(ERROR_MESSAGE);
        }
      });

      describe('when it does not throw', () => {
        test('and it resolves with a value', async () => {
          let theTask = safeExample(123);
          expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, unknown>>();
          await theTask;
          if (theTask.isResolved) {
            expect(theTask.value.isJust).toBe(true);
            if (theTask.value.isJust) {
              expect(theTask.value.value).toBe(123);
            }
          } else {
            expect.unreachable();
          }
        });

        test('and it resolves with null', async () => {
          let theTask = safeExample(123, { returnNull: true });
          expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, unknown>>();
          await theTask;
          if (theTask.isResolved) {
            expect(theTask.value.isNothing).toBe(true);
          } else {
            expect.unreachable();
          }
        });

        test('and it rejects', async () => {
          let theTask = safeExample(123, { rejectPromise: true });
          expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, unknown>>();
          await theTask;
          if (theTask.isRejected) {
            expect(theTask.reason).toBe(REJECTION_REASON);
          } else {
            expect.unreachable();
          }
        });
      });
    });

    describe('with an error handler', () => {
      let safeExample = safeNullable(example, stringify);
      expectTypeOf(safeExample).toEqualTypeOf<
        (
          value: number,
          should?: { throwErr?: boolean; rejectPromise?: boolean; returnNull?: boolean }
        ) => Task<Maybe<number>, string>
      >();

      test('when it throws', async () => {
        let theTask = safeExample(123, { throwErr: true });
        expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, string>>();
        await theTask;
        if (theTask.isRejected) {
          expect(theTask.reason).toBe('{}'); // Errors stringify weirdly
        }
      });

      describe('when it does not throw', () => {
        test('and it resolves with a value', async () => {
          let theTask = safeExample(123);
          expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, string>>();
          await theTask;
          if (theTask.isResolved) {
            expect(theTask.value.isJust).toBe(true);
            if (theTask.value.isJust) {
              expect(theTask.value.value).toBe(123);
            }
          } else {
            expect.unreachable();
          }
        });

        test('and it resolves with null', async () => {
          let theTask = safeExample(123, { returnNull: true });
          expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, string>>();
          await theTask;
          if (theTask.isResolved) {
            expect(theTask.value.isNothing).toBe(true);
          } else {
            expect.unreachable();
          }
        });

        test('and it rejects', async () => {
          let theTask = safeExample(123, { rejectPromise: true });
          expectTypeOf(theTask).toEqualTypeOf<Task<Maybe<number>, string>>();
          await theTask;
          if (theTask.isRejected) {
            expect(theTask.reason).toBe(`"${REJECTION_REASON}"`);
          } else {
            expect.unreachable();
          }
        });
      });
    });
  });

  describe('fromPromise', () => {
    describe('`without a rejection handler`', () => {
      test('when the promise resolves', async () => {
        let { promise, resolve } = deferred<number, never>();
        let theTask = fromPromise(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();

        resolve(123);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<number, unknown>>();
        expect(unwrap(theResult)).toBe(123);
      });

      test('when the promise rejects', async () => {
        let { promise, reject } = deferred<never, string>();
        let theTask = fromPromise(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<never, unknown>>();

        let theError = 'la';
        reject(theError);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<never, unknown>>();
        expect(unwrapErr(theResult)).toEqual(theError);
      });
    });

    describe('with a rejection handler', () => {
      test('when the promise resolves', async () => {
        let { promise, resolve } = deferred<number, never>();
        let theTask = fromPromise(promise, stringify);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolve(123);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<number, string>>();
        expect(unwrap(theResult)).toBe(123);
      });

      test('when the promise rejects', async () => {
        let { promise, reject } = deferred<never, string>();
        let theTask = fromPromise(promise, stringify);
        expectTypeOf(theTask).toEqualTypeOf<Task<never, string>>();

        let theError = 'la';
        reject(theError);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<never, string>>();
        expect(unwrapErr(theResult)).toEqual(stringify(theError));
      });
    });
  });

  describe('fromUnsafePromise', () => {
    test('when the promise resolves', async () => {
      let { promise, resolve } = deferred<Result<number, string>, never>();
      let theTask = fromUnsafePromise(promise);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      let theInputResult = Result.ok<number, string>(123);
      resolve(theInputResult);
      let theResultingResult = await theTask;
      expect(theResultingResult).toEqual(Result.ok(123));
      expectTypeOf(theResultingResult).toEqualTypeOf(theInputResult);
    });

    test('with a `Promise<Result<T, E>>`', async () => {
      let { promise, resolve } = deferred<Result<number, string>, never>();
      let theTask = fromUnsafePromise(promise);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      resolve(Result.ok(123));
      let result = await theTask;
      expect(unwrap(result)).toEqual(123);
    });

    test('when the promise rejects', async () => {
      let processPromise = new Promise((resolve) => {
        process.on('unhandledRejection', (error) => {
          resolve(error);
        });
      });

      let { promise, reject } = deferred<Result<number, string>, unknown>();
      let theTask = fromUnsafePromise(promise);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      let theReason = 'not good';
      try {
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

  describe('fromResult', () => {
    test('from Ok', async () => {
      let theResult = Result.ok<number, string>(123);
      let theTask = fromResult(theResult);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
      let result = await theTask;
      expect(result.isOk).toBe(true);
      expect(theTask.state).toEqual(State.Resolved);
    });

    test('from Err', async () => {
      let theResult = Result.err<number, string>('error');
      let theTask = fromResult(theResult);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
      let result = await theTask;
      expect(result.isErr).toBe(true);
      expect(theTask.state).toEqual(State.Rejected);
    });
  });

  describe('map', () => {
    describe('with both arguments', () => {
      test('for a pending promise', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = map((n: number) => n % 2 == 0, task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

        resolve(123);
        await theTask;
      });

      test('when the promise resolves', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = map((n: number) => n % 2 == 0, task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

        resolve(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(false);
      });

      test('when the promise rejects', async () => {
        let { task, reject } = Task.withResolvers<number, string>();
        let theTask = map((n: number) => n % 2 == 0, task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

        let theReason = 'nope';
        reject(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });
    });

    describe('with curried form', () => {
      test('for a pending promise', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = map((n: number) => n % 2 == 0)(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, unknown>>();

        resolve(123);
        await theTask;
      });

      test('when the promise resolves', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = map((n: number) => n % 2 == 0)(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, unknown>>();

        resolve(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(false);
      });

      test('when the promise rejects', async () => {
        let { task, reject } = Task.withResolvers<number, string>();
        let theTask = map((n: number) => n % 2 == 0)(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, unknown>>();

        let theReason = 'nope';
        reject(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });
    });
  });

  describe('mapRejected', () => {
    describe('with both arguments', () => {
      test('for a pending promise', async () => {
        let { task } = Task.withResolvers<number, string>();
        let theTask = mapRejected(stringify, task);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
      });

      test('when the promise resolves', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = mapRejected(stringify, task);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolve(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(123);
      });

      test('when the promise rejects', async () => {
        let { task, reject } = Task.withResolvers<number, string>();
        let theTask = mapRejected(stringify, task);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theReason = 'nope';
        reject(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(stringify(theReason));
      });
    });

    describe('with curried form', () => {
      test('for a pending promise', async () => {
        let { task } = Task.withResolvers<number, string>();
        let theTask = mapRejected(stringify)(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<unknown, string>>();
      });

      test('when the promise resolves', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = mapRejected(stringify)(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<unknown, string>>();

        resolve(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(123);
      });

      test('when the promise rejects', async () => {
        let { task, reject } = Task.withResolvers<number, string>();
        let theTask = mapRejected(stringify)(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<unknown, string>>();

        let theReason = 'nope';
        reject(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(stringify(theReason));
      });
    });
  });

  describe('and', () => {
    describe('with both arguments', () => {
      describe('when the first Task resolves', () => {
        test('when the second Task resolves', async () => {
          let theValue = 'hello';
          let theTask = and(Task.resolve(theValue), Task.resolve(123));
          expectTypeOf(theTask).toEqualTypeOf<Task<string, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual(theValue);
        });

        test('when the second Task rejects', async () => {
          let theReason = 'hello';
          let theTask = and(
            Task.reject<number, string>(theReason),
            Task.resolve<number, string>(123)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });
      });

      describe('when the first Task rejects', () => {
        test('when the second Task resolves', async () => {
          let theReason = 123;
          let theTask = and(
            Task.resolve<number, number>(456),
            Task.reject<string, number>(theReason)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });

        test('when the second Task rejects', async () => {
          let theReason = 123;
          let theTask = and(
            Task.reject<string, number>(456),
            Task.reject<string, number>(theReason)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });
      });
    });

    describe('with curried form', () => {
      describe('when the first Task resolves', () => {
        test('when the second Task resolves', async () => {
          let theValue = 'hello';
          let theTask = and(Task.resolve(theValue))(Task.resolve(123));
          expectTypeOf(theTask).toEqualTypeOf<Task<string, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual(theValue);
        });

        test('when the second Task rejects', async () => {
          let theReason = 'hello';
          let theTask = and(Task.reject<number, string>(theReason))(
            Task.resolve<number, string>(123)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });
      });

      describe('when the first Task rejects', () => {
        test('when the second Task resolves', async () => {
          let theReason = 123;
          let theTask = and(Task.resolve<number, number>(456))(
            Task.reject<string, number>(theReason)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });

        test('when the second Task rejects', async () => {
          let theReason = 123;
          let theTask = and(Task.reject<string, number>(456))(
            Task.reject<string, number>(theReason)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(theReason);
        });
      });
    });
  });

  describe('andThen', () => {
    describe('with both arguments', () => {
      test('for a pending task', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = andThen((n) => Task.resolve(n % 2 == 0), task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

        resolve(123);
        await theTask;
      });

      test('when the task resolves', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = andThen((n) => Task.resolve(n % 2 == 0), task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

        resolve(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(false);
      });

      test('when the task rejects', async () => {
        let { task, reject } = Task.withResolvers<number, string>();
        let theTask = andThen(() => Task.reject('oh no'), task);
        expectTypeOf(theTask).toEqualTypeOf<Task<never, string>>();

        let theReason = 'nope';
        reject(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });
    });

    describe('with curried form', () => {
      test('for a pending task', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = andThen((n: number) => Task.resolve(n % 2 == 0))(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, unknown>>();

        resolve(123);
        await theTask;
      });

      test('when the task resolves', async () => {
        let { task, resolve } = Task.withResolvers<number, string>();
        let theTask = andThen((n: number) => Task.resolve(n % 2 == 0))(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, unknown>>();

        resolve(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(false);
      });

      test('when the task rejects', async () => {
        let { task, reject } = Task.withResolvers<number, string>();
        let theTask = andThen(() => Task.reject('oh no'))(task);
        expectTypeOf(theTask).toEqualTypeOf<Task<never, unknown>>();

        let theReason = 'nope';
        reject(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });
    });
  });

  describe('or', () => {
    describe('with both arguments', () => {
      describe('when the first Task resolves', () => {
        test('when the second Task resolves', async () => {
          let theTask = or(Task.resolve('B'), Task.resolve('A'));
          expectTypeOf(theTask).toEqualTypeOf<Task<string, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual('A');
        });

        test('when the second Task rejects', async () => {
          let theReason = 'hello';
          let theTask = or(
            Task.reject<number, string>(theReason),
            Task.resolve<number, string>(123)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toBe(123);
        });
      });

      describe('when the first Task rejects', () => {
        test('when the second Task resolves', async () => {
          let theTask = or(Task.resolve('B'), Task.reject<string, number>(123));
          expectTypeOf(theTask).toEqualTypeOf<Task<string, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toBe('B');
        });

        test('when the second Task rejects', async () => {
          let theTask = or(Task.reject<string, number>(456), Task.reject<string, number>(123));
          expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toBe(456);
        });
      });
    });

    describe('with curried form', () => {
      describe('when the first Task resolves', () => {
        test('when the second Task resolves', async () => {
          let theTask = or(Task.resolve('B'))(Task.resolve('A'));
          expectTypeOf(theTask).toEqualTypeOf<Task<unknown, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual('A');
        });

        test('when the second Task rejects', async () => {
          let theReason = 'hello';
          let theTask = or(Task.reject<number, string>(theReason))(
            Task.resolve<number, string>(123)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<unknown, string>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toBe(123);
        });
      });

      describe('when the first Task rejects', () => {
        test('when the second Task resolves', async () => {
          let theTask = or(Task.resolve('B'))(Task.reject<string, number>(123));
          expectTypeOf(theTask).toEqualTypeOf<Task<unknown, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toBe('B');
        });

        test('when the second Task rejects', async () => {
          let theTask = or(Task.reject<string, number>(456))(Task.reject<string, number>(123));
          expectTypeOf(theTask).toEqualTypeOf<Task<unknown, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toBe(456);
        });
      });
    });
  });

  describe('orElse', () => {
    test('for a pending promise', async () => {
      let theTask = orElse((reason) => Task.resolve(reason.length), new Task<number, string>(noOp));
      expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();

      expect(theTask.state).toBe(State.Pending);
    });

    test('when the promise resolves', async () => {
      let theTask = orElse(
        (reason) => Task.resolve(reason.length),
        Task.resolve<number, string>(123)
      );
      expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();

      let result = await theTask;
      expect(unwrap(result)).toBe(123);
    });

    test('when the promise rejects', async () => {
      let theTask = orElse(
        (reason) => Task.reject(reason.length),
        Task.reject<number, string>('first error')
      );
      expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();

      let result = await theTask;
      expect(unwrapErr(result)).toBe(11);
    });
  });

  describe('match', () => {
    describe('with both arguments', () => {
      test('with a resolved task', async () => {
        let result = await match(
          {
            Resolved: (n) => n * 2,
            Rejected: () => -1,
          },
          Task.resolve(2)
        );
        expect(result).toBe(4);
      });

      test('with a rejected task', async () => {
        let result = await match(
          {
            Resolved: (n) => n * 2,
            Rejected: () => -1,
          },
          Task.reject('oops')
        );
        expect(result).toBe(-1);
      });

      test('with a pending task', async () => {
        let result = match(
          {
            Resolved: (n: number) => n * 2,
            Rejected: () => -1,
          },
          new Task(noOp)
        );
        expectTypeOf(result).toEqualTypeOf<Promise<number>>();
      });
    });

    describe('with curried form', () => {
      test('with a resolved task', async () => {
        let result = await match({
          Resolved: (n: number) => n * 2,
          Rejected: () => -1,
        })(Task.resolve(2));
        expect(result).toBe(4);
      });

      test('with a rejected task', async () => {
        let result = await match({
          Resolved: (n: number) => n * 2,
          Rejected: () => -1,
        })(Task.reject('oops'));
        expect(result).toBe(-1);
      });

      test('with a pending task', async () => {
        let result = match({
          Resolved: (n: number) => n * 2,
          Rejected: () => -1,
        })(new Task(noOp));
        expectTypeOf(result).toEqualTypeOf<Promise<number>>();
      });
    });
  });

  describe('timeout', () => {
    describe('with both arguments', () => {
      describe('with a number', () => {
        test('that is shorter', async () => {
          // shorter by dint of "literally any timeout is shorter than never".
          let { task } = Task.withResolvers<string, never>();
          let result = await timeout(1, task);
          expect(result.isErr).toBe(true);
          if (result.isErr) {
            expect(result.error.duration).toBe(1);
          } else {
            expect.unreachable();
          }
        });

        test('that is equal', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(duration, task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });

        test('that is longer', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(duration * 2, task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });
      });

      describe('with another timer', () => {
        test('that is shorter', async () => {
          // shorter by dint of "literally any timeout is shorter than never".
          let { task } = Task.withResolvers<string, never>();
          let result = await timeout(timer(1), task);
          expect(result.isErr).toBe(true);
          if (result.isErr) {
            expect(result.error.duration).toBe(1);
          } else {
            expect.unreachable();
          }
        });

        test('that is equal', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(timer(duration), task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });

        test('that is longer', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(timer(duration * 2), task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });
      });
    });

    describe('with curried form', () => {
      describe('with a number', () => {
        test('that is shorter', async () => {
          // shorter by dint of "literally any timeout is shorter than never".
          let { task } = Task.withResolvers<string, never>();
          let result = await timeout(1)(task);
          expect(result.isErr).toBe(true);
          if (result.isErr) {
            expect((result.error as Timeout).duration).toBe(1);
          } else {
            expect.unreachable();
          }
        });

        test('that is equal', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(duration)(task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });

        test('that is longer', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(duration * 2)(task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });
      });

      describe('with another timer', () => {
        test('that is shorter', async () => {
          // shorter by dint of "literally any timeout is shorter than never".
          let { task } = Task.withResolvers<string, never>();
          let result = await timeout(timer(1))(task);
          expect(result.isErr).toBe(true);
          if (result.isErr) {
            expect((result.error as Timeout).duration).toBe(1);
          } else {
            expect.unreachable();
          }
        });

        test('that is equal', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(timer(duration))(task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });

        test('that is longer', async () => {
          let duration = 1;
          let task = new Task((resolve) => setTimeout(() => resolve(duration), duration));
          let result = await timeout(timer(duration * 2))(task);
          expect(result.isOk).toBe(true);
          expect(unwrap(result)).toBe(duration);
        });
      });
    });
  });

  describe('toPromise', () => {
    test('with a directly-constructed task', async () => {
      let { task, resolve } = Task.withResolvers();
      let promise = toPromise(task);

      let theValue = 'hello';
      resolve(theValue);
      let output = await promise;
      expect(unwrap(output)).toEqual(theValue);
    });

    test('with a passed-in-promise', async () => {
      let { promise: theInputPromise, resolve } = deferred();
      let theTask = fromPromise(theInputPromise);

      let theValue = 123;
      resolve(theValue);
      let theResult = await toPromise(theTask);
      expect(unwrap(theResult)).toEqual(theValue);
    });
  });

  describe('withRetries', () => {
    test('when the task initially rejects but later resolves', async () => {
      let theTask = withRetries(({ count }) => {
        return count === 0
          ? Task.reject('not the first time')
          : Task.resolve('but the second will do!');
      });

      let theResult = await theTask;
      expect(unwrap(theResult)).toEqual('but the second will do!');
    });

    describe('when the task never resolves', () => {
      test('not using the `status` parameter', async () => {
        let theTask = withRetries(() => {
          return Task.reject('this test *always* rejects until the count runs out');
        });

        let theError = unwrapErr(await theTask);
        assert(theError instanceof Error);
        expect(isRetryFailed(theError));
        expect(printError(theError)).toMatch(
          /TrueMyth.Task.RetryFailed: Stopped retrying after 3 tries \(\d+ms\)/
        );
      });

      test('using the `status` parameter', async () => {
        let theCount = 2;
        let theMessage = `maximum count is ${theCount}`;
        let theTask = withRetries(({ count }) => {
          if (count >= theCount) {
            return stopRetrying(theMessage);
          }

          return Task.reject('this test *always* rejects until the count runs out');
        });

        let theError = unwrapErr(await theTask);
        assert(theError instanceof Error);
        let errorDesc = printError(theError);
        expect(errorDesc).toMatch(
          /TrueMyth\.Task\.RetryFailed: Stopped retrying after 2 tries \(\d+ms\)/
        );
        expect(errorDesc).toMatch(`\tcaused by: TrueMyth.Task.StopRetrying: ${theMessage}`);
      });

      test('when it rejects with `stopRetrying`', async () => {
        let theMessage = 'any reason at all will do';
        let theTask = withRetries(() => {
          return Task.reject(stopRetrying(theMessage));
        });

        let theError = unwrapErr(await theTask);
        assert(theError instanceof Error);
        let errorDesc = printError(theError);
        expect(errorDesc).toMatch(
          /TrueMyth\.Task\.RetryFailed: Stopped retrying after 0 tries \(\d+ms\)/
        );
        expect(errorDesc).toMatch(`\tcaused by: TrueMyth.Task.StopRetrying: ${theMessage}`);
      });

      test('when it rejects with a non-zero duration', async () => {
        let theResult = await withRetries(() => Task.reject('never succeeds'), take(fixed(), 5));
        let theError = unwrapErr(theResult);
        assert(theError instanceof Error);
        expect(printError(theError)).toMatch(
          /TrueMyth\.Task\.RetryFailed: Stopped retrying after 5 tries \(\d+ms\)/
        );
      });
    });
  });

  describe('delays', () => {
    describe('exponential', () => {
      test('with default factor (2)', () => {
        let values = Array.from(take(exponential(), 5));
        expect(values).toEqual([1, 2, 4, 8, 16]);
      });

      test('with custom factor', () => {
        let values = Array.from(take(exponential({ withFactor: 4 }), 5));
        expect(values).toEqual([1, 4, 16, 64, 256]);
      });

      describe('with non-integral base', () => {
        test('that should round down', () => {
          let values = Array.from(take(exponential({ from: 1.1 }), 5));
          expect(values).toEqual([1, 2, 4, 8, 16]);
        });

        test('that should round up', () => {
          let values = Array.from(take(exponential({ from: 0.9 }), 5));
          expect(values).toEqual([1, 2, 4, 8, 16]);
        });
      });
    });

    describe('fibonacci', () => {
      test('with default values', () => {
        let values = Array.from(take(fibonacci(), 5));
        expect(values).toEqual([1, 1, 2, 3, 5]);
      });

      test('with initial value `1`', () => {
        let values = Array.from(take(fibonacci({ from: 1 }), 5));
        expect(values).toEqual([1, 1, 2, 3, 5]);
      });

      test('with initial value `2`', () => {
        let values = Array.from(take(fibonacci({ from: 2 }), 5));
        expect(values).toEqual([2, 2, 4, 6, 10]);
      });

      describe('with non-integral initial value', () => {
        test('that should be rounded down', () => {
          let values = Array.from(take(fibonacci({ from: 1.1 }), 5));
          expect(values).toEqual([1, 1, 2, 3, 5]);
        });

        test('that should be rounded up', () => {
          let values = Array.from(take(fibonacci({ from: 0.9 }), 5));
          expect(values).toEqual([1, 1, 2, 3, 5]);
        });
      });
    });

    describe('fixed', () => {
      test('with default initial value', () => {
        let values = Array.from(take(fixed(), 5));
        expect(values).toEqual([1, 1, 1, 1, 1]);
      });

      test('with integral value', () => {
        let values = Array.from(take(fixed({ at: 5 }), 5));
        expect(values).toEqual([5, 5, 5, 5, 5]);
      });

      test('with non-integral value', () => {
        let values = Array.from(take(fixed({ at: 1.2 }), 5));
        expect(values).toEqual([1, 1, 1, 1, 1]);
      });
    });

    test('immediate', () => {
      let values = Array.from(take(immediate(), 5));
      expect(values).toEqual([0, 0, 0, 0, 0]);
    });

    describe('linear', () => {
      test('with default initial value and step size', () => {
        let values = Array.from(take(linear(), 10));
        expect(values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });

      test('with custom initial value', () => {
        let values = Array.from(take(linear({ from: 1 }), 5));
        expect(values).toEqual([1, 2, 3, 4, 5]);
      });

      test('with custom step size', () => {
        let values = Array.from(take(linear({ withStepSize: 2 }), 5));
        expect(values).toEqual([0, 2, 4, 6, 8]);
      });

      test('with non-integral value', () => {
        let values = Array.from(take(linear({ from: 1.1, withStepSize: 2 }), 5));
        expect(values).toEqual([1, 3, 5, 7, 9]);
      });
    });

    test('none', () => {
      let values = Array.from(none());
      expect(values.length).toBe(0);
    });

    describe('jitter', () => {
      let originalMathRandom: typeof Math.random;
      beforeEach(() => {
        originalMathRandom = Math.random;
      });

      afterEach(() => {
        Math.random = originalMathRandom;
      });

      test('with random value below 0.5', () => {
        Math.random = () => 0.25;

        let input = [1, 2, 3];
        let output = input.map(jitter);

        for (let index in input) {
          expect(output[index]).toBeLessThanOrEqual(input[index]! * 2);
          expect(output[index]).toBeGreaterThanOrEqual(0);
        }
      });

      test('with random value above 0.5', () => {
        Math.random = () => 0.75;

        let input = [1, 2, 3];
        let output = input.map(jitter);

        for (let index in input) {
          expect(output[index]).toBeLessThanOrEqual(input[index]! * 2);
          expect(output[index]).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });
});

describe('type utilities', () => {
  test('results for array of tasks', () => {
    expectTypeOf<Settled<[Task<string, number>]>>().toEqualTypeOf<[Result<string, number>]>();
    expectTypeOf<Settled<[Task<string, number>, Task<number, string>]>>().toEqualTypeOf<
      [Result<string, number>, Result<number, string>]
    >;
    expectTypeOf<
      Settled<
        [
          Task<string, number>,
          Task<number, string>,
          Task<boolean, Error>,
          Task<{ complicatedObjectStuff: string[] }, Error>,
        ]
      >
    >().toEqualTypeOf<
      [
        Result<string, number>,
        Result<number, string>,
        Result<boolean, Error>,
        Result<{ complicatedObjectStuff: string[] }, Error>,
      ]
    >();

    expectTypeOf<
      Settled<Array<Task<string, number> | Task<number, string> | Task<boolean, Error>>>
    >().toEqualTypeOf<Array<Result<string | number | boolean, number | string | Error>>>();
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

function* take<T>(iterable: Iterable<T>, count: number): IterableIterator<T> {
  let taken = 0;
  for (let item of iterable) {
    if (taken >= count) {
      return;
    }

    taken += 1;
    yield item;
  }
}

function printError(e: Error): string {
  // prettier-ignore
  let maybeCause =
    e.cause instanceof Error ? Maybe.just(printError(e.cause)) :

    Maybe.of(
      // @ts-ignore: work around a bug in older TypeScript versions where the
      // lib definitions incorrectly required `cause` to be an `Error`. That is
      // the best practice, but it is not required.
      e.cause?.toString()
    );

  let cause = maybeCause.mapOr('', (cause) => `\n\tcaused by: ${cause}`);
  return `${e.name}: ${e.message}${cause}`;
}
