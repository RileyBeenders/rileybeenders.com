export type GanttTableData = {
  chart: string;
  columns: string[];
  rows: string[][];
};

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/**
 * Parses the hand-edited gantt.md format: a ```mermaid fenced gantt
 * definition followed by a markdown table. Kept intentionally simple since
 * the file is self-authored, not arbitrary markdown.
 */
export function parseGanttFile(raw: string): GanttTableData {
  const mermaidMatch = raw.match(/```mermaid\r?\n([\s\S]*?)```/);
  const chart = mermaidMatch ? mermaidMatch[1].trim() : "";

  const tableLines = raw.split(/\r?\n/).filter((line) => line.trim().startsWith("|"));
  const columns = tableLines.length > 0 ? parseTableRow(tableLines[0]) : [];
  const rows = tableLines.slice(2).map(parseTableRow);

  return { chart, columns, rows };
}
