import { beforeEach, expect, it, vi } from "vitest";
import { loadGame, loadSaveSlots, persistGame } from "./storage";
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
it("loads up to three independently saved slots", async () => {
  mock.getItem.mockResolvedValueOnce(
    JSON.stringify([
      { ...INITIAL_SAVE(), playerName: "Mint" },
      null,
      { ...INITIAL_SAVE(), playerName: "Beam" },
    ]),
  );
  const slots = await loadSaveSlots();
  expect(slots[0]?.playerName).toBe("Mint");
  expect(slots[1]).toBeNull();
  expect(slots[2]?.playerName).toBe("Beam");
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
  expect(JSON.parse(mock.setItem.mock.calls[1][1])[0]).toMatchObject({
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
it("keeps the other save slots when the legacy writer updates slot one", async () => {
  mock.getItem.mockResolvedValue(
    JSON.stringify([
      { ...INITIAL_SAVE(), playerName: "Old" },
      { ...INITIAL_SAVE(), playerName: "Mint" },
      { ...INITIAL_SAVE(), playerName: "Beam" },
    ]),
  );
  await persistGame({ ...INITIAL_SAVE(), playerName: "New" });
  const written = JSON.parse(mock.setItem.mock.calls.at(-1)?.[1] ?? "null");
  expect(written.map((slot: { playerName?: string }) => slot.playerName)).toEqual([
    "New",
    "Mint",
    "Beam",
  ]);
});
