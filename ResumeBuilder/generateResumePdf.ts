import { jsPDF } from "jspdf";
import type { ResumeData } from "@/types/resume";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_LEFT = 44;
const MARGIN_RIGHT = 44;
const MARGIN_TOP = 40;
const CONTENT_BOTTOM = 742;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

type FontStyle = "normal" | "bold" | "italic" | "bolditalic";
type Color = readonly [number, number, number];

const TEXT: Color = [20, 20, 20];
const MUTED: Color = [78, 78, 78];
const RULE: Color = [188, 188, 188];
const LIGHT_RULE: Color = [224, 224, 224];

type ContactItem = {
  label: string;
  url?: string;
};

function normalizeText(value: string): string {
  return value
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201F]/g, '"')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00B3/g, "^3")
    .replace(/\u00A0/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function displayUrl(value: string): string {
  return normalizeText(value)
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

function safeLink(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const parsed = new URL(value);
    return ["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol)
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

export function generateResumePdf(data: ResumeData): ArrayBuffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    compress: true,
    putOnlyUsedFonts: true
  });

  let y = MARGIN_TOP;

  function setTextStyle(size: number, style: FontStyle = "normal", color: Color = TEXT) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  }

  function wrapText(text: string, width: number, size: number, style: FontStyle = "normal"): string[] {
    setTextStyle(size, style);
    return doc.splitTextToSize(normalizeText(text), width) as string[];
  }

  function addPage(continuationLabel?: string) {
    doc.addPage("letter", "portrait");
    y = MARGIN_TOP;

    if (!continuationLabel) return;

    setTextStyle(8, "italic", MUTED);
    doc.text(normalizeText(continuationLabel), MARGIN_LEFT, y);
    y += 7;
    doc.setDrawColor(...LIGHT_RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
    y += 14;
  }

  function ensureSpace(height: number, continuationLabel?: string) {
    if (y + height > CONTENT_BOTTOM) {
      addPage(continuationLabel);
      return true;
    }

    return false;
  }

  function drawWrappedText(options: {
    text: string;
    x?: number;
    width?: number;
    size?: number;
    lineHeight?: number;
    style?: FontStyle;
    color?: Color;
    continuationLabel?: string;
    gapAfter?: number;
  }) {
    const {
      text,
      x = MARGIN_LEFT,
      width = CONTENT_WIDTH,
      size = 9.25,
      lineHeight = 12,
      style = "normal",
      color = TEXT,
      continuationLabel,
      gapAfter = 0
    } = options;
    const lines = wrapText(text, width, size, style);

    ensureSpace(Math.min(lines.length, 2) * lineHeight, continuationLabel);
    setTextStyle(size, style, color);

    for (const line of lines) {
      if (y + lineHeight > CONTENT_BOTTOM) {
        addPage(continuationLabel);
        setTextStyle(size, style, color);
      }

      doc.text(line, x, y);
      y += lineHeight;
    }

    y += gapAfter;
  }

  function drawSectionHeading(title: string, firstItemHeight = 24) {
    const topGap = y > MARGIN_TOP + 2 ? 12 : 0;
    ensureSpace(topGap + 18 + firstItemHeight);
    y += topGap;

    const label = normalizeText(title).toUpperCase();
    setTextStyle(11, "bold");
    doc.text(label, MARGIN_LEFT, y);

    const labelWidth = doc.getTextWidth(label);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.6);
    doc.line(MARGIN_LEFT + labelWidth + 10, y - 3, PAGE_WIDTH - MARGIN_RIGHT, y - 3);
    y += 17;
  }

  function drawContactRow(items: ContactItem[]) {
    const separator = "  |  ";
    const size = 8.5;
    const lineHeight = 11;
    let x = MARGIN_LEFT;

    setTextStyle(size, "normal", MUTED);

    items.forEach((item, index) => {
      const label = normalizeText(item.label);
      const separatorWidth = index === 0 ? 0 : doc.getTextWidth(separator);
      const labelWidth = doc.getTextWidth(label);

      if (index > 0 && x + separatorWidth + labelWidth > PAGE_WIDTH - MARGIN_RIGHT) {
        y += lineHeight;
        x = MARGIN_LEFT;
      } else if (index > 0) {
        doc.text(separator, x, y);
        x += separatorWidth;
      }

      doc.text(label, x, y);
      const url = safeLink(item.url);
      if (url) {
        doc.link(x, y - size, labelWidth, lineHeight, { url });
      }
      x += labelWidth;
    });

    y += lineHeight;
  }

  function drawBullet(text: string, continuationLabel: string) {
    const markerX = MARGIN_LEFT + 2;
    const textX = MARGIN_LEFT + 14;
    const width = CONTENT_WIDTH - 14;
    const size = 9.1;
    const lineHeight = 11.75;
    const lines = wrapText(text, width, size);

    ensureSpace(Math.min(lines.length, 2) * lineHeight + 2, continuationLabel);
    setTextStyle(size);

    lines.forEach((line, index) => {
      if (y + lineHeight > CONTENT_BOTTOM) {
        addPage(continuationLabel);
        setTextStyle(size);
      }

      if (index === 0) {
        doc.text("-", markerX, y);
      }
      doc.text(line, textX, y);
      y += lineHeight;
    });

    y += 2;
  }

  function measureExperienceOpening(job: ResumeData["experience"][number]) {
      const dateRange = normalizeText(`${job.start} - ${job.end}`);
      setTextStyle(9, "normal", MUTED);
      const dateWidth = doc.getTextWidth(dateRange);
      const availableRoleWidth = CONTENT_WIDTH - dateWidth - 18;
      const dateIsInline = availableRoleWidth >= 260;
      const roleWidth = dateIsInline ? availableRoleWidth : CONTENT_WIDTH;
      const roleLines = wrapText(job.role, roleWidth, 10.5, "bold");
      const companyLines = wrapText(`${job.company} | ${job.location}`, CONTENT_WIDTH, 9);
      const contextLines = job.context
        ? wrapText(job.context, CONTENT_WIDTH, 8.4, "italic")
        : [];
      const firstBulletLines = job.bullets[0]
        ? wrapText(job.bullets[0].text, CONTENT_WIDTH - 14, 9.1)
        : [];
      const estimatedHeaderHeight = roleLines.length * 12
        + (dateIsInline ? 0 : 10.5)
        + companyLines.length * 10.5
        + contextLines.length * 10.5
        + Math.min(firstBulletLines.length, 2) * 11.75
        + 14;

      return {
        companyLines,
        dateIsInline,
        dateRange,
        estimatedHeaderHeight,
        roleLines
      };
  }

  function drawExperience() {
    const firstJobHeight = data.experience[0]
      ? measureExperienceOpening(data.experience[0]).estimatedHeaderHeight
      : 24;
    drawSectionHeading("Experience", firstJobHeight);

    data.experience.forEach((job, jobIndex) => {
      const {
        companyLines,
        dateIsInline,
        dateRange,
        estimatedHeaderHeight,
        roleLines
      } = measureExperienceOpening(job);
      const separatorHeight = jobIndex > 0 ? 12 : 0;

      const startedNewPage = ensureSpace(
        separatorHeight + estimatedHeaderHeight,
        jobIndex > 0 ? "Experience (continued)" : undefined
      );

      if (jobIndex > 0 && !startedNewPage) {
        doc.setDrawColor(...LIGHT_RULE);
        doc.setLineWidth(0.45);
        doc.line(MARGIN_LEFT, y + 1, PAGE_WIDTH - MARGIN_RIGHT, y + 1);
        y += separatorHeight;
      }

      setTextStyle(10.5, "bold");
      roleLines.forEach((line, index) => {
        doc.text(line, MARGIN_LEFT, y);
        if (index === 0 && dateIsInline) {
          setTextStyle(9, "normal", MUTED);
          doc.text(dateRange, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });
          setTextStyle(10.5, "bold");
        }
        y += 12;
      });

      if (!dateIsInline) {
        setTextStyle(9, "normal", MUTED);
        doc.text(dateRange, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });
        y += 10.5;
      }

      setTextStyle(9, "normal", MUTED);
      companyLines.forEach((line) => {
        doc.text(line, MARGIN_LEFT, y);
        y += 10.5;
      });

      const continuationLabel = `${job.role} - ${job.company} (continued)`;

      if (job.context) {
        y += 2;
        drawWrappedText({
          text: job.context,
          size: 8.4,
          lineHeight: 10.5,
          style: "italic",
          color: MUTED,
          continuationLabel,
          gapAfter: 4
        });
      } else {
        y += 4;
      }

      job.bullets.forEach((bullet) => drawBullet(bullet.text, continuationLabel));
    });
  }

  function measureEducationDegree(item: ResumeData["education"]["degrees"][number]) {
      const graduation = normalizeText(item.graduation);
      setTextStyle(9, "normal", MUTED);
      const graduationWidth = doc.getTextWidth(graduation);
      const availableSchoolWidth = CONTENT_WIDTH - graduationWidth - 18;
      const graduationIsInline = availableSchoolWidth >= 250;
      const schoolWidth = graduationIsInline ? availableSchoolWidth : CONTENT_WIDTH;
      const schoolLines = wrapText(item.school, schoolWidth, 10, "bold");
      const degreeLines = wrapText(item.degree, CONTENT_WIDTH, 9);
      const itemHeight = schoolLines.length * 11.5
        + (graduationIsInline ? 0 : 10)
        + degreeLines.length * 11
        + 7;

      return {
        degreeLines,
        graduation,
        graduationIsInline,
        itemHeight,
        schoolLines
      };
  }

  function measureCertificate(certificate: ResumeData["education"]["certificates"][number]) {
    const nameLines = wrapText(certificate.certificateName, CONTENT_WIDTH, 9, "bold");
    const detail = [certificate.issuer, certificate.date].filter(Boolean).join(" | ");
    const detailLines = wrapText(detail, CONTENT_WIDTH, 8.5);
    const credentialUrl = safeLink(certificate.credentialUrl);
    const credentialLabel = credentialUrl
      ? normalizeText(certificate.credentialLabel || "Credential")
      : undefined;
    const itemHeight = nameLines.length * 10.5
      + detailLines.length * 10
      + (credentialLabel ? 10 : 0)
      + 6;

    return {
      credentialLabel,
      credentialUrl,
      detailLines,
      itemHeight,
      nameLines
    };
  }

  function drawEducation() {
    const firstEducationItemHeight = data.education.degrees[0]
      ? measureEducationDegree(data.education.degrees[0]).itemHeight
      : data.education.certificates[0]
        ? 17 + measureCertificate(data.education.certificates[0]).itemHeight
        : 24;
    drawSectionHeading("Education", firstEducationItemHeight);

    data.education.degrees.forEach((item) => {
      const {
        degreeLines,
        graduation,
        graduationIsInline,
        itemHeight,
        schoolLines
      } = measureEducationDegree(item);

      ensureSpace(itemHeight, "Education (continued)");
      setTextStyle(10, "bold");
      schoolLines.forEach((line, index) => {
        doc.text(line, MARGIN_LEFT, y);
        if (index === 0 && graduationIsInline) {
          setTextStyle(9, "normal", MUTED);
          doc.text(graduation, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });
          setTextStyle(10, "bold");
        }
        y += 11.5;
      });

      if (!graduationIsInline) {
        setTextStyle(9, "normal", MUTED);
        doc.text(graduation, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });
        y += 10;
      }

      setTextStyle(9, "normal", MUTED);
      degreeLines.forEach((line) => {
        doc.text(line, MARGIN_LEFT, y);
        y += 11;
      });
      y += 7;
    });

    if (data.education.certificates.length === 0) return;

    const firstCertificate = measureCertificate(data.education.certificates[0]);
    ensureSpace(17 + firstCertificate.itemHeight, "Education and certifications (continued)");
    y += 4;
    setTextStyle(9, "bold");
    doc.text("CERTIFICATIONS", MARGIN_LEFT, y);
    y += 13;

    data.education.certificates.forEach((certificate) => {
      const {
        credentialLabel,
        credentialUrl,
        detailLines,
        itemHeight,
        nameLines
      } = measureCertificate(certificate);

      ensureSpace(itemHeight, "Education and certifications (continued)");
      setTextStyle(9, "bold");
      nameLines.forEach((line) => {
        doc.text(line, MARGIN_LEFT, y);
        y += 10.5;
      });
      setTextStyle(8.5, "normal", MUTED);
      detailLines.forEach((line) => {
        doc.text(line, MARGIN_LEFT, y);
        y += 10;
      });

      if (credentialLabel && credentialUrl) {
        setTextStyle(8.25, "bold", MUTED);
        doc.textWithLink(credentialLabel, MARGIN_LEFT, y, { url: credentialUrl });
        const credentialWidth = doc.getTextWidth(credentialLabel);
        doc.setDrawColor(...MUTED);
        doc.setLineWidth(0.4);
        doc.line(MARGIN_LEFT, y + 1, MARGIN_LEFT + credentialWidth, y + 1);
        y += 10;
      }
      y += 6;
    });
  }

  function drawSkills() {
    const firstGroup = data.skills[0];
    const firstGroupHeight = firstGroup
      ? wrapText(firstGroup.category, CONTENT_WIDTH, 9.5, "bold").length * 11.5
        + Math.min(wrapText(firstGroup.items.join(", "), CONTENT_WIDTH, 8.7).length, 2) * 11
        + 6
      : 24;
    drawSectionHeading("Skills", firstGroupHeight);

    data.skills.forEach((group) => {
      const categoryLines = wrapText(group.category, CONTENT_WIDTH, 9.5, "bold");
      const itemLines = wrapText(group.items.join(", "), CONTENT_WIDTH, 8.7);
      const blockHeight = categoryLines.length * 11.5
        + Math.min(itemLines.length, 2) * 11
        + 6;

      ensureSpace(blockHeight, "Skills (continued)");
      setTextStyle(9.5, "bold");
      categoryLines.forEach((line) => {
        doc.text(line, MARGIN_LEFT, y);
        y += 11.5;
      });
      drawWrappedText({
        text: group.items.join(", "),
        size: 8.7,
        lineHeight: 11,
        color: MUTED,
        continuationLabel: "Skills (continued)",
        gapAfter: 8
      });
    });
  }

  function measureEducationAndSkillsHeight() {
    const educationHeadingHeight = 17;
    const degreeHeight = data.education.degrees.reduce(
      (total, item) => total + measureEducationDegree(item).itemHeight,
      0
    );
    const certificateHeight = data.education.certificates.length > 0
      ? 17 + data.education.certificates.reduce(
        (total, certificate) => total + measureCertificate(certificate).itemHeight,
        0
      )
      : 0;
    const skillsHeight = data.skills.length > 0
      ? 29 + data.skills.reduce((total, group) => {
        const categoryLines = wrapText(group.category, CONTENT_WIDTH, 9.5, "bold");
        const itemLines = wrapText(group.items.join(", "), CONTENT_WIDTH, 8.7);
        return total + categoryLines.length * 11.5 + itemLines.length * 11 + 8;
      }, 0)
      : 0;

    return educationHeadingHeight + degreeHeight + certificateHeight + skillsHeight;
  }

  const person = data.person;
  const websiteUrl = safeLink(person.website);
  const linkedinUrl = safeLink(person.linkedin);
  const githubUrl = safeLink(person.github);

  doc.setProperties({
    title: `${normalizeText(person.name)} - Resume`,
    author: normalizeText(person.name),
    subject: normalizeText(person.title),
    keywords: "resume, electromechanical engineering, research and development",
    creator: "RileyBeenders.com ResumeBuilder"
  });

  setTextStyle(23, "bold");
  doc.text(normalizeText(person.name), MARGIN_LEFT, y);
  y += 18;

  setTextStyle(11, "normal", MUTED);
  doc.text(normalizeText(person.title), MARGIN_LEFT, y);
  y += 17;

  drawContactRow([
    { label: person.location },
    { label: person.email, url: `mailto:${person.email}` }
  ]);
  drawContactRow([
    { label: displayUrl(person.website), url: websiteUrl },
    { label: displayUrl(person.linkedin), url: linkedinUrl },
    { label: displayUrl(person.github), url: githubUrl }
  ]);

  y += 3;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 17;

  const summaryOpeningHeight = Math.min(wrapText(data.summary, CONTENT_WIDTH, 9.25).length, 2) * 12.25;
  drawSectionHeading("Profile", summaryOpeningHeight);
  drawWrappedText({
    text: data.summary,
    size: 9.25,
    lineHeight: 12.25,
    gapAfter: 2
  });

  drawExperience();

  const remainingResumeHeight = measureEducationAndSkillsHeight();
  const fullPageContentHeight = CONTENT_BOTTOM - MARGIN_TOP;
  if (
    remainingResumeHeight <= fullPageContentHeight
    && y + 12 + remainingResumeHeight > CONTENT_BOTTOM
  ) {
    addPage();
  }

  drawEducation();
  drawSkills();

  const pageCount = doc.getNumberOfPages();
  const footerWebsite = displayUrl(person.website);

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);
    doc.setDrawColor(...LIGHT_RULE);
    doc.setLineWidth(0.45);
    doc.line(MARGIN_LEFT, 758, PAGE_WIDTH - MARGIN_RIGHT, 758);
    setTextStyle(7.5, "normal", MUTED);
    doc.text(footerWebsite, MARGIN_LEFT, 772);
    doc.text(`Page ${pageNumber} of ${pageCount}`, PAGE_WIDTH - MARGIN_RIGHT, 772, { align: "right" });
  }

  return doc.output("arraybuffer");
}
