import { waitFor } from './wait-for';

describe('wait-for', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * This is how "delays" should be implemented with fake timers if
   * something is waiting asynchronously
   * ```ts
   * await fakeTimersDelay(123);
   * ```
   * Because without await, the JS "thread" doesn't change context to
   * continue the execution for the part being awaited asynchronously
   */
  function delayWithFakeTimers(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
      jest.advanceTimersByTime(ms);
    });
  }

  it('should wait until the given condition matches', async () => {
    const RESOLVED_VALUE = 'resolved';
    let polledValue: string | undefined = undefined;
    setTimeout(() => {
      polledValue = RESOLVED_VALUE;
    }, 225);
    const condition = jest.fn(() => polledValue);

    const promise = waitFor(condition);

    while (!polledValue) {
      await delayWithFakeTimers(50);
    }

    const value = await promise;
    expect(condition).toHaveBeenCalled();
    expect(value).toBe(RESOLVED_VALUE);
  });

  it('should fail if timeouts before the condition is resolved', async () => {
    let failed = undefined;
    waitFor(() => false, { timeout: 1000 }).catch((err) => {
      failed = err;
    });

    while (!failed) {
      await delayWithFakeTimers(200);
    }

    expect(failed).toBe('waitFor.timeout');
  });

  it('should give the specified info when rejecting if provided', async () => {
    let failed = undefined;
    waitFor(() => false, { timeout: 1000, name: 'test message' }).catch(
      (err) => {
        failed = err;
      }
    );

    while (!failed) {
      await delayWithFakeTimers(200);
    }

    expect(failed).toBe('test message.timeout');
  });

  it('should override fake timers when specified', async () => {
    try {
      await waitFor(() => false, { useRealTimer: true, timeout: 100 });
      expect(true).toBe(false);
    } catch {
      expect(true).toBe(true);
    }
  });

  it('should be able to customize the poll interval', async () => {
    const RESOLVED_VALUE = 'resolved';
    let polledValue: string | undefined = undefined;
    setTimeout(() => {
      polledValue = RESOLVED_VALUE;
    }, 100);
    const slowPoll = jest.fn(() => polledValue);
    const fastPoll = jest.fn(() => polledValue);

    waitFor(slowPoll, { pollInterval: 50 });
    waitFor(fastPoll, { pollInterval: 20 });

    while (!polledValue) {
      await delayWithFakeTimers(10);
    }

    expect(slowPoll).toHaveBeenCalledTimes(2);
    expect(fastPoll).toHaveBeenCalledTimes(5);
  });

  it('should be able to NG values (to accept null, etc. as OK values)', async () => {
    // by default `0` is NG (waitFor doesn't resolve)
    let failed = false;
    waitFor(() => 0, { timeout: 1000 }).catch(() => {
      failed = true;
    });

    while (!failed) {
      await delayWithFakeTimers(50);
    }

    expect(failed).toBe(true);

    // call waitFor accept `0` as an OK value
    let resolved = false;
    waitFor(() => 0, { timeout: 1000, ngValues: [false, undefined] }).then(
      () => {
        resolved = true;
      }
    );

    while (!resolved) {
      await delayWithFakeTimers(50);
    }

    expect(resolved).toBe(true);
  });
});
