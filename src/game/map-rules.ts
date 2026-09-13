export function mapImplementation(platform: string) {
  return {
    native: true,
    provider: platform === "android" ? "google" : "default",
  } as const;
}
