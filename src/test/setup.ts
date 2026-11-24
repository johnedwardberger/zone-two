// Minimal browser globals for store tests running in Node.
const g = globalThis as unknown as Record<string, unknown>
if (!g.window) g.window = globalThis
if (!g.localStorage) {
  const m = new Map<string, string>()
  g.localStorage = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  }
}
