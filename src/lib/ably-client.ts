import * as Ably from "ably";

export function createAblyClient(): Ably.Realtime {
  return new Ably.Realtime({
    authCallback: async (_data, callback) => {
      try {
        const res = await fetch("/api/ably-token");
        if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
        const tokenRequest = await res.json();
        callback(null, tokenRequest);
      } catch (err) {
        callback(err instanceof Error ? err.message : "Auth failed", null);
      }
    },
    autoConnect: false,
  });
}
