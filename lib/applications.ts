import type { GanttTableData } from "@/lib/gantt";

/** One application made before this site, from data/more-info/past-applications.json. */
export type PastApplication = {
  jobTitle: string;
  company: string;
  location: string;
  /** ISO date, YYYY-MM-DD. */
  dateSubmitted: string;
  resumeUsed: string;
  status: string;
  jobId: string;
};

export type ApplicationRow = {
  cells: string[];
  /** Applied before this site and its tailored resumes existed. */
  beforeSite: boolean;
};

/** The live table's columns. The three-digit tracker ID stays on GitHub only. */
export const APPLICATION_COLUMNS = [
  "Status",
  "Job Title",
  "Company",
  "Location",
  "Date Submitted",
  "Resume Used",
  "Job ID"
];

/** gantt.md header for each live column, where the two differ. */
const GANTT_HEADER: Record<string, string> = { Location: "Location (Goal)" };

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC"
});

function formatIsoDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

function sortKey(date: string): number {
  const time = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : `${date} UTC`);
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

/**
 * Every application, oldest first: the pre-site list plus the gantt.md tracker
 * rows, mapped onto APPLICATION_COLUMNS. Same-day rows keep their source order.
 */
export function buildApplicationRows(tracker: GanttTableData, past: PastApplication[]): ApplicationRow[] {
  const columnIndex = APPLICATION_COLUMNS.map((column) =>
    tracker.columns.indexOf(GANTT_HEADER[column] ?? column)
  );
  const dateColumn = APPLICATION_COLUMNS.indexOf("Date Submitted");

  const before: ApplicationRow[] = past.map((application) => {
    const byColumn: Record<string, string> = {
      Status: application.status,
      "Job Title": application.jobTitle,
      Company: application.company,
      Location: application.location || "—",
      "Date Submitted": application.dateSubmitted,
      "Resume Used": application.resumeUsed,
      "Job ID": application.jobId || "N/A"
    };
    return { beforeSite: true, cells: APPLICATION_COLUMNS.map((column) => byColumn[column] ?? "") };
  });

  const withSite: ApplicationRow[] = tracker.rows.map((row) => ({
    beforeSite: false,
    cells: columnIndex.map((index) => (index >= 0 ? row[index] ?? "" : ""))
  }));

  return [...before, ...withSite]
    .map((row, order) => ({ row, order, key: sortKey(row.cells[dateColumn]) }))
    .sort((a, b) => a.key - b.key || a.order - b.order)
    .map(({ row }) =>
      row.beforeSite
        ? { ...row, cells: row.cells.map((cell, i) => (i === dateColumn ? formatIsoDate(cell) : cell)) }
        : row
    );
}
