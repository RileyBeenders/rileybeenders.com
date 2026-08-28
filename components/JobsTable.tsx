import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

type JobsTableProps = {
  columns: string[];
  rows: string[][];
  /** "v3" renders against the light Blueprint Press palette. */
  variant?: "default" | "v3";
};

// Anchored + greedy so a URL containing literal parentheses (e.g. a PDF
// filename like "...(Controls Automation)...pdf") doesn't get truncated at
// the first ")" — every link in this table fills its entire cell, so
// matching to the last ")" at the end of the string is always correct.
const WHOLE_CELL_LINK_PATTERN = /^\[([^\]]+)\]\((.+)\)$/;

function renderCell(text: string): ReactNode {
  const match = text.match(WHOLE_CELL_LINK_PATTERN);
  if (!match) return text;

  return (
    <a href={match[2]} target="_blank" rel="noreferrer" suppressHydrationWarning>
      {match[1]}
      <ExternalLink aria-hidden="true" size={12} />
    </a>
  );
}

export function JobsTable({ columns, rows, variant = "default" }: JobsTableProps) {
  if (columns.length === 0 || rows.length === 0) return null;

  return (
    <div className={variant === "v3" ? "v3-table-wrap" : "jobs-table-wrap"}>
      <table className={variant === "v3" ? "v3-table" : "jobs-table"}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row[0] ?? rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={columns[cellIndex] ?? cellIndex}>{renderCell(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
