// browser logger that mirrors to server (optional) and console
type LogLevel = "info" | "warn" | "error";
const endpoint = import.meta.env.VITE_LOG_ENDPOINT || "/__logs";

export function log(level: LogLevel, msg: string, extra: Record<string, unknown> = {}) {
  const entry = { ts: new Date().toISOString(), level, msg, ...extra };
  // console evidence
  (console as any)[level]?.(msg, extra) ?? console.log(msg, extra);
  // server mirror (vite dev proxy or tiny server) – best-effort
  fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) })
    .catch(() => void 0);
}
