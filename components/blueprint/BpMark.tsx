type BpMarkProps = {
  /** Rendered size in px. */
  size?: number;
  /** Unique per instance — several marks on one page must not share a gradient id. */
  id: string;
  /** Loop the draw / hold / bounce-back animation continuously. */
  animated?: boolean;
  /** Gentle idle bob, for the footer mark. */
  float?: boolean;
  /** Light-on-dark treatment. */
  reversed?: boolean;
  /** Drop the enclosing circle. */
  bare?: boolean;
};

/**
 * The RB monogram. The stem is one stroke; both bowls of the B are a single
 * continuous curve that leaves the top of the stem and lands at its base
 * without lifting. The gradient runs along that travel so the eye follows the
 * direction of flow.
 */
export function BpMark({
  size = 34,
  id,
  animated = false,
  float = false,
  reversed = false,
  bare = false
}: BpMarkProps) {
  const gradientId = `bp-mark-${id}`;
  const stem = reversed ? "var(--paper)" : "var(--ink)";
  const ring = reversed ? "#5a7488" : "var(--ink)";
  // Stroke weight has to grow as the mark shrinks or the bowls fill in.
  const weight = size <= 20 ? 3.4 : size <= 28 ? 2.9 : 2.4;

  const className = [
    "bp-mark",
    animated ? "bp-mark--animated" : "",
    float ? "bp-mark--float" : ""
  ].filter(Boolean).join(" ");

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="13" y1="10" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={reversed ? "#fbfbf9" : "var(--ink)"} />
          <stop offset="1" stopColor={reversed ? "#5fc0f0" : "var(--blue)"} />
        </linearGradient>
      </defs>

      {!bare && (
        <circle
          cx="20"
          cy="20"
          r="18.4"
          stroke={ring}
          strokeWidth={size <= 24 ? 1.5 : 1}
          data-chase
        />
      )}

      <path
        d="M13 10.6v18.8"
        stroke={stem}
        strokeWidth={weight}
        strokeLinecap="round"
        data-draw
        style={{ "--len": 19, "--delay": "0.44s" } as React.CSSProperties}
      />

      <path
        d="M13 10.6c7.6 0 11.3 1.9 11.3 4.7 0 2.7-3.7 4.6-11.3 4.6 8.6 0 12.7 2 12.7 4.8 0 2.6-4.1 4.7-12.7 4.7"
        stroke={size <= 24 ? "var(--blue)" : `url(#${gradientId})`}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-draw
        style={{ "--len": 62, "--delay": "0.72s" } as React.CSSProperties}
      />
    </svg>
  );
}
