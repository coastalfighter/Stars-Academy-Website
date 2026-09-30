import { getPageSnapshot, getProgressSnapshot, resetScrollState, setScrollState, subscribeScroll } from "@/lib/scroll/store";

describe("scroll store", () => {
  beforeEach(() => resetScrollState());

  it("stores the latest values", () => {
    setScrollState(2.5, 0.4);
    expect(getProgressSnapshot()).toBe(2.5);
    expect(getPageSnapshot()).toBe(0.4);
  });

  it("notifies subscribers only on meaningful change", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeScroll(listener);
    setScrollState(1, 0.1);
    setScrollState(1.001, 0.1001); // below epsilon
    setScrollState(1.2, 0.15);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    setScrollState(3, 0.9);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
