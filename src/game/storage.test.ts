import { beforeEach, expect, it, vi } from "vitest";
import { loadGame, persistGame } from "./storage";
import { INITIAL_SAVE } from "./data";
import { chooseStarter, recordCapture } from "./save-rules";
const mock = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: mock }));

beforeEach(() => {
  mock.getItem.mockReset();
  mock.setItem.mockReset();
  mock.setItem.mockResolvedValue(undefined);
});
it("loads a corrupt save without crashing", async () => {
  mock.getItem.mockResolvedValue("{broken json");
  expect((await loadGame()).ownedCreatureIds).toEqual([]);
});
it("serializes writes so an older save cannot overwrite a capture", async () => {
  let release!: () => void;
  mock.setItem.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const first = chooseStarter(INITIAL_SAVE(), "gulfin");
  const captured = recordCapture(first, "faculty");
  const a = persistGame(first),
    b = persistGame(captured);
  await vi.waitFor(() => expect(mock.setItem).toHaveBeenCalledTimes(1));
  release();
  await Promise.all([a, b]);
  expect(JSON.parse(mock.setItem.mock.calls[1][1])).toMatchObject({
    ownedCreatureIds: ["gulfin", "friolera"],
    completedEncounterIds: ["faculty"],
  });
});
it("allows the next write after a storage failure", async () => {
  mock.setItem.mockRejectedValueOnce(new Error("disk unavailable"));
  await expect(persistGame(INITIAL_SAVE())).rejects.toThrow("disk unavailable");
  await expect(
    persistGame(chooseStarter(INITIAL_SAVE(), "cleaf")),
  ).resolves.toBeUndefined();
});
