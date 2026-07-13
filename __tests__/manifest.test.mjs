import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, it, expect } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dirname, "../manifest.json"), "utf-8"));

describe("manifest.json", () => {
  it("has required string fields", () => {
    for (const field of ["id", "name", "version", "description", "entrypoint", "runtime", "icon"]) {
      expect(manifest[field], `missing field: ${field}`).toBeTruthy();
    }
  });
  it("entrypoint/runtime/storage are standard", () => {
    expect(manifest.entrypoint).toBe("index.html");
    expect(manifest.runtime).toBe("static");
    expect(manifest.storage).toBe("db");
  });
  it("version follows semver", () => expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/));
  it("has a nav label", () => expect(manifest.nav?.label).toBeTruthy());

  it("answers are sealed_until with clock release, one per member, frozen after close", () => {
    const p = manifest.row_policies?.answers;
    expect(p?.kind).toBe("sealed_until");
    expect(p?.parent_table).toBe("rounds");
    expect(p?.visible_parent_status_values).toEqual(["closed"]);
    expect(p?.visible_after_parent_column).toBe("reveal_at");
    expect(p?.max_per_member?.limit).toBe(1);
    expect(p?.max_per_member?.scope_columns).toEqual(["round_id"]);
    expect(p?.frozen_when?.locked_values).toContain("closed");
  });

  it("rounds are household-visible with visibility-scoped writes", () => {
    const p = manifest.row_policies?.rounds;
    expect(p?.kind).toBe("owner_or_visibility");
    expect(p?.write_visibility_scoped).toBe(true);
  });

  it("marks (public answered receipts) inherit round visibility, one per member per round", () => {
    const p = manifest.row_policies?.marks;
    expect(p?.kind).toBe("inherit_visibility");
    expect(p?.parent_table).toBe("rounds");
    expect(p?.max_per_member?.limit).toBe(1);
  });

  it("has no ai_access (personal answers stay out of AI listings)", () => {
    expect(manifest.ai_access).toBeUndefined();
  });
});
