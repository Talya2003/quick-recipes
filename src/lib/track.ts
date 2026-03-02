export type TrackProps = Record<string, string | number | boolean | null | undefined>;

export function track(eventName: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    eventName,
    props,
    ts: new Date().toISOString()
  };

  window.dispatchEvent(new CustomEvent("quick_recipes_track", { detail: payload }));

  if (process.env.NODE_ENV !== "production") {
    // Placeholder analytics hook until a vendor is connected.
    console.info("[track]", payload);
  }
}
