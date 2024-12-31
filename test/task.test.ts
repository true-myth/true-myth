import { describe, expect, expectTypeOf, test } from 'vitest';

import Task, { InvalidAccess, State, UnsafePromise } from 'true-myth/task';
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
    describe('`try`', () => {
      test('when the promise resolves', async () => {
        let { promise, resolveWith } = deferred<number, never>();
        let theTask = Task.try(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, unknown>>();

        resolveWith(123);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<number, unknown>>();
        expect(unwrap(theResult)).toBe(123);
      });

      test('when the promise rejects', async () => {
        let { promise, rejectWith } = deferred<never, string>();
        let theTask = Task.try(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<never, unknown>>();

        let theError = 'la';
        rejectWith(theError);
        let theResult = await theTask;
        expectTypeOf(theResult).toEqualTypeOf<Result<never, unknown>>();
        expect(unwrapErr(theResult)).toEqual(theError);
      });
    });

    describe('`unsafeTrusted`', () => {
      test('when the task resolves', async () => {
        let { promise, resolveWith } = deferred<Result<number, string>, never>();
        let theTask = Task.unsafeTrusted(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theInputResult = Result.ok<number, string>(123);
        resolveWith(theInputResult);
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

        let { promise, rejectWith } = deferred<Result<number, string>, unknown>();
        let theTask = Task.unsafeTrusted(promise);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theReason = 'not good';
        try {
          // Yes, we must explicitly await both the task and the original
          // promise, or else the error will not show up deterministically.
          rejectWith(theReason);
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
        let { promise, resolveWith } = deferred<number, string>();
        let theTask = Task.tryOr(promise, 'lolnope');
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolveWith(123);
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrap(result)).toBe(123);
      });

      test('when the task rejects', async () => {
        let { promise, rejectWith } = deferred<number, string>();
        let theTask = Task.tryOr(promise, 'lolnope');
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        rejectWith('<this value does not matter>');
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrapErr(result)).toBe('lolnope');
      });
    });

    describe('`tryOrElse', () => {
      test('when the task resolves', async () => {
        let { promise, resolveWith } = deferred<number, never>();
        let theTask = Task.tryOrElse(promise, stringify);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        resolveWith(123);
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrap(result)).toBe(123);
      });

      test('when the task rejects', async () => {
        let { promise, rejectWith } = deferred<number, string>();
        let theTask = Task.tryOrElse(promise, stringify);
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let theError = 'oh teh noes';
        rejectWith(theError);
        let result = await theTask;
        expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        expect(unwrapErr(result)).toBe(stringify(theError));
      });
    });
  });

  describe('static `resolved` constructor', () => {
    test('produces `Task<Unit, never>` when passed no arguments', () => {
      let theTask = Task.resolved();
      expectTypeOf(theTask).toEqualTypeOf<Task<Unit, never>>();
    });

    test('produces `Task<T, never>` when passed a basic argument', () => {
      let theValue = 'hello';
      let theTask = Task.resolved(theValue);
      expectTypeOf(theTask).toEqualTypeOf<Task<typeof theValue, never>>();
    });

    test('allows explicitly setting a type for `E`', () => {
      let rejectedWithUnit = Task.resolved<Unit, string>();
      expectTypeOf(rejectedWithUnit).toEqualTypeOf<Task<Unit, string>>();

      let rejectedWithValue = Task.resolved<string, number>('hello');
      expectTypeOf(rejectedWithValue).toEqualTypeOf<Task<string, number>>();
    });
  });

  describe('static `rejected` constructor', () => {
    test('produces `Task<never, Unit>` when passed no arguments', () => {
      let theTask = Task.rejected();
      expectTypeOf(theTask).toEqualTypeOf<Task<never, Unit>>();
    });

    test('produces `Task<never, E>` when passed an argument', () => {
      let theReason = 'uh oh';
      let theTask = Task.rejected(theReason);
      expectTypeOf(theTask).toEqualTypeOf<Task<never, typeof theReason>>();
    });

    test('allows explicitly setting a type for `T`', () => {
      let rejectedWithUnit = Task.rejected<string>();
      expectTypeOf(rejectedWithUnit).toEqualTypeOf<Task<string, Unit>>();

      let rejectedWithValue = Task.rejected<string, number>(123);
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
      let { promise, resolveWith } = deferred<number, string>();
      let theTask = Task.try(promise);
      expect(theTask.state).toBe(State.Pending);
      // don't leak it!
      resolveWith(123);
      await promise;
    });

    test('is Resolved once the promise resolves', async () => {
      let { promise, resolveWith } = deferred<number, string>();
      let successfulTask = Task.try(promise);
      resolveWith(123);
      let result = await successfulTask;
      expect(successfulTask.state).toBe(State.Resolved);
      expect(unwrap(result)).toBe(123);
    });

    test('is Rejected if the promise rejects', async () => {
      let { promise, rejectWith } = deferred<number, string>();

      let theTask = Task.try(promise);
      let anError = 'oh teh noes';
      rejectWith(anError);

      let result = await theTask;
      expect(theTask.state).toBe(State.Rejected);
      expect(unwrapErr(result)).toEqual(anError);
    });
  });

  describe('static `from` method', () => {
    test('with a pending promise', async () => {
      let { promise, resolveWith } = deferred<number, never>();
      let theTask = Task.tryOrElse(promise, stringify);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
      expect(theTask.state).toBe(State.Pending);

      resolveWith(123);
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
      let { promise, resolveWith } = deferred<Result<number, string>, never>();
      let theTask = Task.unsafeTrusted(promise);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      resolveWith(Result.ok(123));
      let result = await theTask;
      expect(unwrap(result)).toEqual(123);
    });
  });

  describe('`map` method', () => {
    test('for a pending promise', async () => {
      let { promise, resolveWith } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).map((n) => n % 2 == 0);
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      resolveWith(123);
      await theTask;
    });

    test('when the promise resolves', async () => {
      let { promise, resolveWith } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).map((n) => n % 2 == 0);
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      resolveWith(123);
      let result = await theTask;
      expect(unwrap(result)).toBe(false);
    });

    test('when the promise rejects', async () => {
      let { promise, rejectWith } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).map((n) => n % 2 == 0);
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      let theReason = 'nope';
      rejectWith(theReason);
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
      let { promise, resolveWith } = deferred<number, string>();
      let theTask = Task.try(promise).mapRejected(stringify);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      resolveWith(123);
      let result = await theTask;
      expect(unwrap(result)).toBe(123);
    });

    test('when the promise rejects', async () => {
      let { promise, rejectWith } = deferred<number, string>();
      let theTask = Task.try(promise).mapRejected(stringify);
      expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

      let theReason = 'nope';
      rejectWith(theReason);
      let result = await theTask;
      expect(unwrapErr(result)).toEqual(stringify(theReason));
    });
  });

  describe('`and` method', () => {
    describe('when the first Task resolves', () => {
      test('when the second Task resolves', async () => {
        let theValue = 'hello';
        let theTask = Task.resolved(123).and(Task.resolved(theValue));
        expectTypeOf(theTask).toEqualTypeOf<Task<string, never>>();
        let theResult = await theTask;
        expect(unwrap(theResult)).toEqual(theValue);
      });

      test('when the second Task rejects', async () => {
        let theReason = 'hello';
        let theTask = Task.resolved<number, string>(123).and(
          Task.rejected<number, string>(theReason)
        );
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toEqual(theReason);
      });
    });

    describe('when the first Task rejects', () => {
      test('when the second Task resolves', async () => {
        let theReason = 123;
        let theTask = Task.rejected<string, number>(theReason).and(
          Task.resolved<number, number>(456)
        );
        expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toEqual(theReason);
      });

      test('when the second Task rejects', async () => {
        let theReason = 123;
        let theTask = Task.rejected<string, number>(theReason).and(
          Task.rejected<string, number>(456)
        );
        expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
        let theResult = await theTask;
        expect(unwrapErr(theResult)).toEqual(theReason);
      });
    });

    // Matches the text in the docs.
    test('all combinations', async () => {
      let resolvedA = Task.resolved<string, string>('A');
      let resolvedB = Task.resolved<string, string>('B');
      let rejectedA = Task.rejected<string, string>('bad');
      let rejectedB = Task.rejected<string, string>('lame');

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
      let { promise, resolveWith } = deferred<number, string>();
      let theTask = Task.tryOrElse(promise, stringify).andThen((n) => Task.resolved(n % 2 == 0));
      expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

      resolveWith(123);
      await theTask;
    });

    describe('when the first `Task` resolves', () => {
      test('when the second is pending', async () => {
        let theTask = Task.resolved<number, string>(123).andThen((n) => {
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
        let { promise, resolveWith } = deferred<number, string>();
        let theTask = Task.tryOrElse(promise, stringify).andThen((n) => Task.resolved(n % 2 == 0));
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, string>>();

        resolveWith(123);
        let result = await theTask;
        expect(unwrap(result)).toBe(false);
      });

      test('when the second `Task` rejects', async () => {
        let { promise, resolveWith } = deferred<number, string>();
        let theTask = Task.tryOrElse(promise, stringify).andThen(() => Task.rejected('oh no'));
        expectTypeOf(theTask).toEqualTypeOf<Task<never, string>>();

        resolveWith(123);
        let result = await theTask;
        expect(unwrapErr(result)).toBe('oh no');
      });
    });

    describe('when the first `Task` rejects', () => {
      test('when the second is pending', async () => {
        let theReason = 'alas!';
        let theTask = Task.rejected<number, string>(theReason).andThen((n) => {
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
        let { promise, rejectWith } = deferred<number, string>();
        let theTask = Task.try(promise).andThen((n) => Task.resolved(n % 2 == 0));
        expectTypeOf(theTask).toEqualTypeOf<Task<boolean, unknown>>();

        let theReason = 'nope';
        rejectWith(theReason);
        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });

      test('when the second `Task` rejects', async () => {
        let theReason = 'nope';
        let theTask = Task.rejected<number, string>(theReason).andThen((n) =>
          Task.rejected<number, string>(n % 2 == 0 ? 'yep' : 'nope')
        );
        expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

        let result = await theTask;
        expect(unwrapErr(result)).toEqual(theReason);
      });
    });

    describe('`or` method', () => {
      describe('when the first Task resolves', async () => {
        test('when the second is pending', async () => {
          let theFirst = Task.resolved(123);
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
          let theTask = Task.resolved(123).or(Task.resolved(456));
          expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual(123);
        });

        test('when the second Task rejects', async () => {
          let theReason = 'hello';
          let theTask = Task.resolved<number, string>(123).or(
            Task.rejected<number, string>(theReason)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toEqual(123);
        });
      });

      describe('when the first Task rejects', () => {
        test('when the second is pending', async () => {
          let theFirst = Task.rejected<unknown, string>('blergh');
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
          let theTask = Task.rejected<string, number>(123).or(
            Task.resolved<string, number>('hello')
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
          let theResult = await theTask;
          expect(unwrap(theResult)).toBe('hello');
        });

        test('when the second Task rejects', async () => {
          let theReason = 123;
          let theTask = Task.rejected<string, number>(theReason).or(
            Task.rejected<string, number>(456)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<string, number>>();
          let theResult = await theTask;
          expect(unwrapErr(theResult)).toEqual(456);
        });
      });

      // Matches the text in the docs.
      test('all combinations', async () => {
        let resolvedA = Task.resolved<string, string>('A');
        let resolvedB = Task.resolved<string, string>('B');
        let rejectedA = Task.rejected<string, string>('bad');
        let rejectedB = Task.rejected<string, string>('lame');

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
          Task.resolved(reason.length)
        );
        expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();

        expect(theTask.state).toBe(State.Pending);
      });

      describe('when the first `Task` resolves', () => {
        test('when the second is pending', async () => {
          let theFirst = Task.resolved<number, string>(123);
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
          let theTask = Task.resolved<number, string>(123).orElse((reason) =>
            Task.resolved(reason.length)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, never>>();

          let result = await theTask;
          expect(unwrap(result)).toBe(123);
        });

        test('when the second `Task` rejects', async () => {
          let theTask = Task.resolved<number, string>(123).orElse((reason) =>
            Task.rejected(reason.length)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, number>>();

          let result = await theTask;
          expect(unwrap(result)).toBe(123);
        });
      });

      describe('when the first `Task` rejects', () => {
        test('when the second is pending', async () => {
          let theFirst = Task.rejected<number, string>('teh sads');
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
          let theTask = Task.rejected<number, string>('nope').orElse((reason) =>
            Task.resolved<number, string>(reason.length)
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, string>>();

          let result = await theTask;
          expect(unwrap(result)).toBe(4);
        });

        test('when the second `Task` rejects', async () => {
          let theTask = Task.rejected<number, string>('first error').orElse((reason) =>
            Task.rejected<number, boolean>(reason.includes("'"))
          );
          expectTypeOf(theTask).toEqualTypeOf<Task<number, boolean>>();

          let result = await theTask;
          expect(unwrapErr(result)).toBe(false);
        });
      });
    });

    describe('`match` method', () => {
      test('with a resolved task', () => {
        Task.tryOrElse(Promise.resolve(123), stringify).match({
          Resolved: (value) => expect(value).toBe(123),
          Rejected: (_reason) => expect.unreachable(),
        });
        expect.assertions(1);
      });

      test('with a rejected task', () => {
        Task.tryOrElse(Promise.reject(123), stringify).match({
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
        expect(() => theTask.value).toThrowError(InvalidAccess);
      });

      test('when the task is resolved', () => {
        let theValue = 123;
        let theTask = Task.resolved(theValue);
        expect(theTask.value).toBe(theValue);
      });

      test('when the task is rejected', () => {
        let theTask = Task.rejected('oh teh noes');
        expect(() => theTask.value).toThrowError(InvalidAccess);
      });
    });

    describe('`reason` accessor', () => {
      test('when the task is pending', () => {
        let theTask = new Task(noOp);
        expect(() => theTask.reason).toThrowError(InvalidAccess);
      });

      test('when the task is resolved', () => {
        let theTask = Task.resolved(123);
        expect(() => theTask.reason).toThrowError(InvalidAccess);
      });

      test('when the task is rejected', () => {
        let theReason = 'oh teh noes';
        let theTask = Task.rejected(theReason);
        expect(theTask.reason).toBe(theReason);
      });
    });
  });

  describe('toString', () => {
    expectTypeOf(Task['toString']).toEqualTypeOf<() => string>();

    test('pending', async () => {
      let { task, resolveWith } = Task.withResolvers();
      expect(task.toString()).toEqual('Task.Pending');

      resolveWith('');
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
      let { task, resolveWith } = Task.withResolvers();
      let promise = task.toPromise();

      let theValue = 'hello';
      resolveWith(theValue);
      let output = await promise;
      expect(unwrap(output)).toEqual(theValue);
    });

    test('with a passed-in-promise', async () => {
      let { promise: theInputPromise, resolveWith } = deferred();
      let theTask = Task.try(theInputPromise);

      let theValue = 123;
      resolveWith(theValue);
      let theResult = await theTask.toPromise();
      expect(unwrap(theResult)).toEqual(theValue);
    });
  });
});

describe('narrowing', () => {
  test('pending', async () => {
    let { promise, resolveWith } = deferred<number, string>();
    let theTask = Task.try(promise);

    if (theTask.state === State.Pending) {
      expect(theTask.isPending()).toBe(true);
      expect(theTask.isResolved()).toBe(false);
      expect(theTask.isRejected()).toBe(false);
    }

    resolveWith(123);
    await theTask;
  });

  test('resolved', async () => {
    let { promise, resolveWith } = deferred<number, string>();
    let theTask = Task.try(promise);

    resolveWith(123);
    await theTask;

    if (theTask.state === State.Resolved) {
      expect(theTask.value).toBe(123);
      expect(theTask.isPending()).toBe(false);
      expect(theTask.isResolved()).toBe(true);
      expect(theTask.isRejected()).toBe(false);
    }
  });

  test('rejected', async () => {
    let { promise, rejectWith } = deferred<number, string>();
    let theTask = Task.tryOrElse(promise, (e) => `${e}`);

    let theError = 'oh teh noes';
    rejectWith(theError);
    await theTask;

    if (theTask.state === State.Rejected) {
      expect(theTask.reason).toBe(theError);
      expect(theTask.isPending()).toBe(false);
      expect(theTask.isResolved()).toBe(false);
      expect(theTask.isRejected()).toBe(true);
    }
  });
});

function deferred<T, E>(): {
  promise: Promise<T>;
  resolveWith: (value: T) => void;
  rejectWith: (reason: E) => void;
} {
  // SAFETY: immediately resolved via promise constructor
  let resolveWith!: (value: T) => void;
  let rejectWith!: (reason: unknown) => void;
  let promise = new Promise<T>((resolve, reject) => {
    resolveWith = resolve;
    rejectWith = reject;
  });
  return { promise, resolveWith: resolveWith, rejectWith: rejectWith };
}

function stringify(reason: unknown): string {
  return JSON.stringify(reason, null, 2);
}

function noOp() {}
