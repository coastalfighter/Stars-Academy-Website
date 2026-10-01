import { redact, redactText } from "./redact";

/**
 * Structured JSON-lines logger.
 *
 * One object per line is what Vercel, Datadog, Better Stack and most log
 * drains index natively, so every server log is searchable by `event`,
 * `level` or any field without regex. All fields are passed through the PII
 * redactor before they are written.
 *
 * Signature-compatible with `console.info/warn/error(message, fields)`, so it
 * can be injected anywhere a console is expected.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogFields = Record<string, unknown>;

type Sink = (level: LogLevel, line: string) => void;

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const consoleSink: Sink = (level, line) => {
  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
};

export type Logger = {
  [L in LogLevel]: (message: string, fields?: unknown) => void;
} & { child: (bindings: LogFields) => Logger };

export function createLogger({
  env = process.env,
  sink = consoleSink,
  bindings = {},
  now = () => new Date(),
}: { env?: NodeJS.ProcessEnv; sink?: Sink; bindings?: LogFields; now?: () => Date } = {}): Logger {
  const configured = (env.LOG_LEVEL ?? "").toLowerCase() as LogLevel;
  const min = ORDER[configured] ?? (env.NODE_ENV === "production" ? ORDER.info : ORDER.debug);

  const write = (level: LogLevel, message: string, fields?: unknown) => {
    if (ORDER[level] < min) return;
    const extra = fields === undefined ? {} : fields !== null && typeof fields === "object" && !Array.isArray(fields) && !(fields instanceof Error) ? fields : { detail: fields };
    let line: string;
    try {
      line = JSON.stringify({
        time: now().toISOString(),
        level,
        service: "stars-web",
        ...(env.VERCEL_ENV ? { deployment: env.VERCEL_ENV } : {}),
        ...(env.VERCEL_GIT_COMMIT_SHA ? { version: env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) } : {}),
        msg: redactText(message),
        ...(redact({ ...bindings, ...(extra as LogFields) }) as LogFields),
      });
    } catch {
      line = JSON.stringify({ time: now().toISOString(), level, service: "stars-web", msg: redactText(message), note: "unserialisable fields" });
    }
    sink(level, line);
  };

  return {
    debug: (m, f) => write("debug", m, f),
    info: (m, f) => write("info", m, f),
    warn: (m, f) => write("warn", m, f),
    error: (m, f) => write("error", m, f),
    child: (more) => createLogger({ env, sink, bindings: { ...bindings, ...more }, now }),
  };
}

/** Process-wide logger. */
export const logger = createLogger();
