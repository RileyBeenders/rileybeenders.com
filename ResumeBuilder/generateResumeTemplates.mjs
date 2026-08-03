import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { jsPDF } from "jspdf";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const LEFT = 36;
const RIGHT = 576;
const CONTENT_WIDTH = RIGHT - LEFT;

const COLOR = {
  navy: [16, 42, 67],
  slate: [51, 78, 104],
  label: [36, 59, 83],
  meta: [139, 154, 168],
  link: [11, 87, 208],
  linkSoft: [205, 225, 252],
  body: [220, 230, 239],
  bodyAlt: [232, 238, 244],
  rule: [142, 163, 181],
  ruleLight: [211, 221, 229]
};

function createDocument(title) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    compress: true,
    putOnlyUsedFonts: true
  });

  doc.setProperties({
    title,
    subject: "Blank color-block resume layout derived from references 001, 005, and 006",
    creator: "RileyBeenders.com ResumeBuilder"
  });
  doc.setLineCap("butt");
  doc.setLineJoin("miter");
  return doc;
}

function box(doc, x, y, width, height, color, radius = 1.5) {
  doc.setFillColor(...color);
  if (radius > 0) {
    doc.roundedRect(x, y, width, height, radius, radius, "F");
  } else {
    doc.rect(x, y, width, height, "F");
  }
}

function rule(doc, y, color = COLOR.rule) {
  box(doc, LEFT, y, CONTENT_WIDTH, 0.75, color, 0);
}

function section(doc, y, headingWidth) {
  box(doc, LEFT, y, headingWidth, 10, COLOR.navy, 1.25);
  rule(doc, y + 12.8);
}

function bodyLine(doc, x, y, width, color = COLOR.body, height = 6.2) {
  box(doc, x, y, width, height, color, 1.3);
}

function bullet(doc, y, widths) {
  box(doc, LEFT + 3, y + 1.6, 3, 3, COLOR.label, 0.7);
  widths.forEach((width, index) => {
    bodyLine(doc, LEFT + 15, y + index * 10.7, width, COLOR.body, 6.2);
  });
}

function drawHeader(doc) {
  box(doc, LEFT, 33, 176, 25, COLOR.navy, 2.5);
  box(doc, LEFT, 63, 498, 10, COLOR.slate, 1.8);

  box(doc, LEFT, 79, 55, 7.5, COLOR.meta, 1.2);
  box(doc, 113, 79, 58, 7.5, COLOR.linkSoft, 1.2);
  ruleSegment(doc, 113, 87.6, 58, COLOR.link);
  box(doc, 193, 79, 98, 7.5, COLOR.linkSoft, 1.2);
  ruleSegment(doc, 193, 87.6, 98, COLOR.link);
  box(doc, 313, 79, 89, 7.5, COLOR.linkSoft, 1.2);
  ruleSegment(doc, 313, 87.6, 89, COLOR.link);
  box(doc, 424, 79, 111, 7.5, COLOR.linkSoft, 1.2);
  ruleSegment(doc, 424, 87.6, 111, COLOR.link);
}

function ruleSegment(doc, x, y, width, color) {
  box(doc, x, y, width, 0.75, color, 0);
}

function drawSummary(doc, headingY, lineWidths) {
  section(doc, headingY, 155);
  lineWidths.forEach((width, index) => {
    bodyLine(doc, LEFT, headingY + 18.7 + index * 11.4, width);
  });
}

function drawExpertise(doc, headingY, rows) {
  section(doc, headingY, 103);
  let y = headingY + 19;

  rows.forEach((row) => {
    box(doc, LEFT, y, row.label, 7, COLOR.label, 1.3);
    bodyLine(doc, LEFT + row.label + 7, y, row.first);
    if (row.second) {
      bodyLine(doc, LEFT, y + 11, row.second, COLOR.bodyAlt);
    }
    y += row.second ? 26 : 15;
  });
}

function drawJobHeader(doc, y, widths = {}) {
  box(doc, LEFT, y, widths.company ?? 180, 8.5, COLOR.label, 1.3);
  box(doc, LEFT + (widths.company ?? 180) + 7, y, widths.location ?? 58, 8.5, COLOR.meta, 1.3);
  box(doc, RIGHT - (widths.date ?? 92), y, widths.date ?? 92, 7.2, COLOR.meta, 1.2);
  box(doc, LEFT, y + 13, widths.role ?? 165, 7, COLOR.slate, 1.2);
}

function drawCompactRow(doc, y, options = {}) {
  const lead = options.lead ?? 185;
  const meta = options.meta ?? 58;
  box(doc, LEFT, y, lead, 7.2, COLOR.label, 1.2);
  box(doc, LEFT + lead + 6, y, meta, 7.2, COLOR.meta, 1.2);
  bodyLine(doc, LEFT + lead + meta + 12, y, options.tail ?? 255, COLOR.body, 6.2);
  if (options.wrap) {
    bodyLine(doc, LEFT, y + 10.5, options.wrap, COLOR.bodyAlt, 6.2);
  }
}

function drawEducation(doc, headingY) {
  section(doc, headingY, 270);
  box(doc, LEFT, headingY + 19, 116, 8, COLOR.label, 1.3);
  bodyLine(doc, 158, headingY + 19, 205, COLOR.body, 6.2);
  box(doc, RIGHT - 63, headingY + 19, 63, 7.2, COLOR.meta, 1.2);
  box(doc, LEFT, headingY + 33, 118, 7, COLOR.label, 1.2);
  bodyLine(doc, 160, headingY + 33, 393, COLOR.bodyAlt, 6.2);
}

function drawOnePageTemplate() {
  const doc = createDocument("1-page Resume Template");
  drawHeader(doc);

  drawSummary(doc, 95, [515, 487, 531, 330]);
  drawExpertise(doc, 168, [
    { label: 88, first: 428, second: 510 },
    { label: 91, first: 425, second: 472 },
    { label: 83, first: 433, second: 498 }
  ]);

  section(doc, 265, 171);
  drawJobHeader(doc, 283, { company: 182, location: 62, date: 92, role: 168 });
  bullet(doc, 307, [505, 474]);
  bullet(doc, 334, [513, 496]);
  bullet(doc, 361, [492, 438]);
  bullet(doc, 388, [518, 452]);
  rule(doc, 422, COLOR.ruleLight);

  drawJobHeader(doc, 431, { company: 143, location: 66, date: 101, role: 405 });
  bullet(doc, 455, [511, 487]);
  bullet(doc, 482, [501, 468]);
  bullet(doc, 509, [518, 446]);
  bullet(doc, 536, [494, 420]);

  section(doc, 574, 218);
  drawCompactRow(doc, 593, { lead: 205, meta: 57, tail: 260, wrap: 494 });
  drawCompactRow(doc, 616, { lead: 196, meta: 66, tail: 259, wrap: 470 });
  drawCompactRow(doc, 639, { lead: 220, meta: 59, tail: 242, wrap: 430 });

  drawEducation(doc, 674);
  return doc;
}

function drawExpandedJob(doc, y, options = {}) {
  drawJobHeader(doc, y, options.header);
  const bullets = options.bullets ?? [
    [510, 485],
    [498, 470],
    [516, 454],
    [489, 421]
  ];
  let bulletY = y + 25;
  bullets.forEach((widths) => {
    bullet(doc, bulletY, widths);
    bulletY += 28;
  });
  return bulletY;
}

function drawContinuationHeader(doc) {
  box(doc, LEFT, 34, 152, 13, COLOR.navy, 1.8);
  box(doc, 356, 37, 66, 6.5, COLOR.linkSoft, 1.1);
  box(doc, 434, 37, 64, 6.5, COLOR.linkSoft, 1.1);
  box(doc, 510, 37, 66, 6.5, COLOR.linkSoft, 1.1);
  rule(doc, 55, COLOR.ruleLight);
}

function drawTwoPageTemplate() {
  const doc = createDocument("2-page Resume Template");
  drawHeader(doc);

  drawSummary(doc, 95, [515, 487, 531, 330]);
  drawExpertise(doc, 168, [
    { label: 88, first: 428, second: 510 },
    { label: 91, first: 425, second: 472 },
    { label: 83, first: 433, second: 498 }
  ]);

  section(doc, 265, 171);
  drawExpandedJob(doc, 284, {
    header: { company: 184, location: 62, date: 92, role: 168 },
    bullets: [[507, 480], [518, 495], [492, 452], [514, 470], [486, 424]]
  });
  rule(doc, 455, COLOR.ruleLight);
  drawExpandedJob(doc, 465, {
    header: { company: 148, location: 66, date: 101, role: 407 },
    bullets: [[513, 486], [496, 458], [520, 489], [501, 444], [516, 465], [475, 410]]
  });

  doc.addPage("letter", "portrait");
  drawContinuationHeader(doc);

  section(doc, 69, 196);
  drawExpandedJob(doc, 88, {
    header: { company: 180, location: 61, date: 96, role: 176 },
    bullets: [[515, 481], [493, 459], [519, 470], [484, 417]]
  });
  rule(doc, 223, COLOR.ruleLight);
  drawExpandedJob(doc, 233, {
    header: { company: 206, location: 58, date: 91, role: 184 },
    bullets: [[502, 477], [518, 486], [491, 448], [511, 463]]
  });

  section(doc, 383, 218);
  drawCompactRow(doc, 402, { lead: 205, meta: 57, tail: 260, wrap: 494 });
  drawCompactRow(doc, 426, { lead: 196, meta: 66, tail: 259, wrap: 470 });
  drawCompactRow(doc, 450, { lead: 220, meta: 59, tail: 242, wrap: 430 });
  drawCompactRow(doc, 474, { lead: 171, meta: 64, tail: 285, wrap: 458 });

  drawEducation(doc, 511);

  section(doc, 574, 203);
  box(doc, LEFT, 593, 105, 7, COLOR.label, 1.2);
  bodyLine(doc, 148, 593, 405, COLOR.body);
  box(doc, LEFT, 607, 121, 7, COLOR.label, 1.2);
  bodyLine(doc, 164, 607, 384, COLOR.bodyAlt);
  box(doc, LEFT, 621, 92, 7, COLOR.label, 1.2);
  bodyLine(doc, 135, 621, 421, COLOR.body);
  box(doc, LEFT, 635, 110, 7, COLOR.label, 1.2);
  bodyLine(doc, 153, 635, 395, COLOR.bodyAlt);

  section(doc, 660, 166);
  bodyLine(doc, LEFT, 679, 522, COLOR.body);
  bodyLine(doc, LEFT, 691, 487, COLOR.bodyAlt);
  bodyLine(doc, LEFT, 703, 515, COLOR.body);
  bodyLine(doc, LEFT, 715, 446, COLOR.bodyAlt);
  bodyLine(doc, LEFT, 727, 392, COLOR.body);

  return doc;
}

function writeDocument(doc, outputPath) {
  writeFileSync(outputPath, Buffer.from(doc.output("arraybuffer")));
}

const outputDirectory = join(process.cwd(), "output", "resumeTemplates");
mkdirSync(outputDirectory, { recursive: true });

writeDocument(drawOnePageTemplate(), join(outputDirectory, "1-page_Template.pdf"));
writeDocument(drawTwoPageTemplate(), join(outputDirectory, "2-Template.pdf"));

console.log(outputDirectory);
