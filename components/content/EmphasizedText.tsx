import { Fragment, type ReactNode } from "react";

type EmphasizedTextProps = {
  text: string;
  phrases?: string[];
  className: string;
};

type TextSegment = {
  text: string;
  emphasized: boolean;
};

/**
 * Splits plain text around exact, Studio-selected phrases. The longest phrase
 * wins when selections overlap, so highlighting "motion control" alongside
 * "motion" still produces one intentional span.
 */
function segmentText(text: string, phrases: string[]): TextSegment[] {
  const usablePhrases = [...new Set(phrases.map((phrase) => phrase.trim()))]
    .filter((phrase) => phrase !== "" && text.includes(phrase))
    .sort((a, b) => b.length - a.length);

  if (usablePhrases.length === 0) return [{ text, emphasized: false }];

  const segments: TextSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let nextIndex = text.length;
    let nextPhrase = "";

    for (const phrase of usablePhrases) {
      const index = text.indexOf(phrase, cursor);
      if (index === -1) continue;
      if (index < nextIndex || (index === nextIndex && phrase.length > nextPhrase.length)) {
        nextIndex = index;
        nextPhrase = phrase;
      }
    }

    if (nextPhrase === "") {
      segments.push({ text: text.slice(cursor), emphasized: false });
      break;
    }

    if (nextIndex > cursor) {
      segments.push({ text: text.slice(cursor, nextIndex), emphasized: false });
    }
    segments.push({ text: nextPhrase, emphasized: true });
    cursor = nextIndex + nextPhrase.length;
  }

  return segments;
}

export function EmphasizedText({ text, phrases = [], className }: EmphasizedTextProps): ReactNode {
  return segmentText(text, phrases).map((segment, index) => (
    <Fragment key={`${index}-${segment.text}`}>
      {segment.emphasized ? <span className={className}>{segment.text}</span> : segment.text}
    </Fragment>
  ));
}
