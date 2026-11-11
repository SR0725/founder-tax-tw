import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

export class ClaudeUnavailable extends Error {}

// Runs the local Claude Code CLI in print mode with no tools, no MCP servers and no user
// settings, so it behaves as a plain model call that returns schema-checked JSON.
export function askClaude(opts: { system: string; prompt: string; schema: object; timeoutMs?: number }): Promise<unknown> {
  // The CLI rejects a schema that carries a "$schema" URI.
  const { $schema: _ignored, ...schema } = opts.schema as Record<string, unknown>;
  void _ignored;
  const args = [
    "-p",
    "--model", "claude-opus-5-5",
    "--effort", "low",
    "--output-format", "json",
    "--json-schema", JSON.stringify(schema),
    "--system-prompt", opts.system,
    "--tools", "",
    "--strict-mcp-config",
    "--setting-sources", "",
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.CLAUDE_BIN ?? "claude", args, { cwd: tmpdir() });
    let out = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new ClaudeUnavailable("Claude took too long"));
    }, opts.timeoutMs ?? 60_000);
    child.stdout.on("data", (chunk) => (out += chunk));
    child.on("error", () => {
      clearTimeout(timer);
      reject(new ClaudeUnavailable("The Claude CLI is not installed on this machine"));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const result = JSON.parse(out);
        if (code !== 0 || result.is_error || !result.structured_output) {
          return reject(new ClaudeUnavailable("Claude did not return a usable answer"));
        }
        resolve(result.structured_output);
      } catch {
        reject(new ClaudeUnavailable("Claude returned output we couldn't read"));
      }
    });
    child.stdin.end(opts.prompt);
  });
}
