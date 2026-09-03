/**
 * Checks every dashboard form field against the Prisma schema, so a typo in
 * config.ts surfaces here rather than as a 500 when an editor hits save. Also
 * reports columns no form exposes, which is how a field silently becomes
 * uneditable.
 *
 *   npx tsx scripts/verify-admin-config.ts
 *
 * Parses prisma/schema.prisma rather than the client's `_runtimeDataModel`,
 * which does not carry `isList` — reading array-ness from it silently reports
 * every String[] as a scalar.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MODELS, type FieldType } from "../lib/admin/config";

type Column = { name: string; type: string; isList: boolean; isRelation: boolean };

/** Columns every form legitimately ignores. */
const IGNORED = new Set(["id", "createdAt", "updatedAt", "images", "project", "projectId"]);

// `list` joined these when Books needed individually editable highlight rows.
const MULTI: FieldType[] = ["tags", "lines", "list"];

function parseSchema(): Map<string, Column[]> {
  const src = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  const models = new Map<string, Column[]>();

  for (const match of src.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
    const [, name, body] = match;
    if (!name || !body) continue;
    const columns: Column[] = [];

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@") || trimmed.startsWith("///")) {
        continue;
      }
      const field = trimmed.match(/^(\w+)\s+(\w+)(\[\])?(\?)?/);
      if (!field) continue;
      const [, fname, ftype, list] = field;
      if (!fname || !ftype) continue;
      columns.push({
        name: fname,
        type: ftype,
        isList: Boolean(list),
        // Resolved below once every model name is known — capitalisation alone
        // is not a signal, since String/Int/Boolean are capitalised too.
        isRelation: false,
      });
    }
    models.set(name, columns);
  }

  // A column is a relation when its type is itself a model in this schema.
  const modelNames = new Set(models.keys());
  for (const columns of models.values()) {
    for (const column of columns) {
      column.isRelation = modelNames.has(column.type);
    }
  }

  return models;
}

const schema = parseSchema();
let problems = 0;

for (const config of Object.values(MODELS)) {
  const modelName = config.model.charAt(0).toUpperCase() + config.model.slice(1);
  const columns = schema.get(modelName);
  if (!columns) {
    console.log(`\n${config.plural}: model "${modelName}" not found in schema`);
    problems += 1;
    continue;
  }

  const byName = new Map(columns.map((c) => [c.name, c]));
  const formFields = config.fields.map((f) => f.name);

  const unknown = formFields.filter((n) => !byName.has(n));
  const notEditable = columns
    .filter(
      (c) =>
        !IGNORED.has(c.name) &&
        !c.isRelation &&
        !formFields.includes(c.name) &&
        // written automatically from showOnPortfolio
        c.name !== "showOnResume",
    )
    .map((c) => c.name);

  const issues: string[] = [];
  for (const field of config.fields) {
    const column = byName.get(field.name);
    if (!column) continue;
    const multi = MULTI.includes(field.type);
    // Relation arrays (Project.images) are driven by the gallery control, which
    // writes to the related table rather than to a scalar column.
    if (column.isRelation) {
      if (field.type !== "gallery") {
        issues.push(`${field.name}: relation but "${field.type}" input`);
      }
      continue;
    }
    if (column.isList && !multi) issues.push(`${field.name}: array column but "${field.type}" input`);
    if (!column.isList && multi) issues.push(`${field.name}: scalar column but "${field.type}" input`);
    if (column.type === "Boolean" && field.type !== "toggle")
      issues.push(`${field.name}: Boolean but "${field.type}"`);
    if (column.type === "Int" && field.type !== "number")
      issues.push(`${field.name}: Int but "${field.type}"`);
    if (column.type === "DateTime" && field.type !== "date")
      issues.push(`${field.name}: DateTime but "${field.type}"`);
  }

  problems += unknown.length + issues.length;
  const ok = unknown.length === 0 && issues.length === 0;
  console.log(
    `\n${config.plural.padEnd(18)} ${String(formFields.length).padStart(2)} fields  ${ok ? "ok" : "PROBLEM"}`,
  );
  if (unknown.length) console.log(`  ! no such column: ${unknown.join(", ")}`);
  for (const issue of issues) console.log(`  ! ${issue}`);
  if (notEditable.length) console.log(`  · not editable in the form: ${notEditable.join(", ")}`);
}

console.log(
  problems === 0
    ? "\nEvery form field maps to a real column with a matching input type."
    : `\n${problems} problems.`,
);
if (problems > 0) process.exitCode = 1;
