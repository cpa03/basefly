import { describe, expect, it } from "vitest";

import { reducer } from "./use-toast";

interface TestToast {
  id: string;
  title?: string;
  description?: string;
  open: boolean;
}

const baseToast: TestToast = {
  id: "1",
  title: "Title",
  description: "Description",
  open: true,
};

describe("useToast reducer", () => {
  it("should add a toast to the top of the list", () => {
    const state = { toasts: [] };
    const next = reducer(state, {
      type: "ADD_TOAST",
      toast: baseToast,
    });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0]).toMatchObject({ id: "1", title: "Title" });
  });

  it("should cap the number of toasts at TOAST_LIMIT", () => {
    const state = {
      toasts: [
        { ...baseToast, id: "3" },
        { ...baseToast, id: "2" },
        { ...baseToast, id: "1" },
      ],
    };
    const next = reducer(state, {
      type: "ADD_TOAST",
      toast: { ...baseToast, id: "4" },
    });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0]?.id).toBe("4");
  });

  it("should update an existing toast by id", () => {
    const state = { toasts: [baseToast] };
    const next = reducer(state, {
      type: "UPDATE_TOAST",
      toast: { id: "1", description: "Updated description" },
    });
    expect(next.toasts[0]?.description).toBe("Updated description");
    expect(next.toasts[0]?.title).toBe("Title");
  });

  it("should dismiss a specific toast by id", () => {
    const state = {
      toasts: [
        { ...baseToast, id: "1" },
        { ...baseToast, id: "2" },
      ],
    };
    const next = reducer(state, {
      type: "DISMISS_TOAST",
      toastId: "1",
    });
    expect(next.toasts.find((t) => t.id === "1")?.open).toBe(false);
    expect(next.toasts.find((t) => t.id === "2")?.open).toBe(true);
  });

  it("should dismiss all toasts when no id is provided", () => {
    const state = {
      toasts: [
        { ...baseToast, id: "1" },
        { ...baseToast, id: "2" },
      ],
    };
    const next = reducer(state, { type: "DISMISS_TOAST" });
    expect(next.toasts.every((t) => t.open === false)).toBe(true);
  });

  it("should remove a specific toast by id", () => {
    const state = {
      toasts: [
        { ...baseToast, id: "1" },
        { ...baseToast, id: "2" },
      ],
    };
    const next = reducer(state, { type: "REMOVE_TOAST", toastId: "1" });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0]?.id).toBe("2");
  });

  it("should remove all toasts when no id is provided", () => {
    const state = {
      toasts: [
        { ...baseToast, id: "1" },
        { ...baseToast, id: "2" },
      ],
    };
    const next = reducer(state, { type: "REMOVE_TOAST" });
    expect(next.toasts).toHaveLength(0);
  });
});
