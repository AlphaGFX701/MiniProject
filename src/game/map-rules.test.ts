import { describe, expect, it } from "vitest";

import { mapImplementation } from "./map-rules";

describe("Android map implementation", () => {
  it("always uses the native Google provider", () => {
    expect(mapImplementation("android")).toEqual({
      native: true,
      provider: "google",
    });
  });
});
