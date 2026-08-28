type BpMarkProps = {
  /** Rendered size in px. */
  size?: number;
  /** Unique per instance — several marks on one page must not share a gradient id. */
  id: string;
  /** Draw the stroke on mount. */
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
  const stem = reversed ? "#fbfbf9" : "#0b1a2b";
  const ring = reversed ? "#5a7488" : "#0b1a2b";
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
          <stop offset="0" stopColor={reversed ? "#fbfbf9" : "#0b1a2b"} />
          <stop offset="1" stopColor={reversed ? "#5fc0f0" : "#2f86c4"} />
        </linearGradient>
      </defs>

      {!bare && (
        <circle
          cx="20"
          cy="20"
          r="18.4"
          stroke={ring}
          strokeWidth={size <= 24 ? 1.5 : 1}
          data-draw
          style={{ "--len": 116, "--delay": "0.05s" } as React.CSSProperties}
        />
      )}

      <path
        d="M13 10.6v18.8"
        stroke={stem}
        strokeWidth={weight}
        strokeLinecap="round"
        data-draw
        style={{ "--len": 19, "--delay": "0.22s" } as React.CSSProperties}
      />

      <path
        d="M13 10.6c7.6 0 11.3 1.9 11.3 4.7 0 2.7-3.7 4.6-11.3 4.6 8.6 0 12.7 2 12.7 4.8 0 2.6-4.1 4.7-12.7 4.7"
        stroke={size <= 24 ? "#2f86c4" : `url(#${gradientId})`}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-draw
        style={{ "--len": 62, "--delay": "0.36s" } as React.CSSProperties}
      />
    </svg>
  );
}
