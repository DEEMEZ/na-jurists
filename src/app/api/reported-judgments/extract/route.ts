import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";

export const runtime = "nodejs";
const require = createRequire(import.meta.url);

type PdfParseFn = (dataBuffer: Buffer) => Promise<{ text?: string }>;

function loadPdfParse(): PdfParseFn {
  // Force CommonJS build to avoid Next webpack ESM worker import issue in deployments.
  const mod = require("pdf-parse") as
    | PdfParseFn
    | {
        default?: PdfParseFn;
        pdf?: PdfParseFn;
      };
  if (typeof mod === "function") return mod;
  if (typeof mod.default === "function") return mod.default;
  if (typeof mod.pdf === "function") return mod.pdf;
  throw new Error("Unable to load pdf-parse parser function.");
}

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

type ExtractedJudgmentFields = {
  citation: string;
  title: string;
  court: string;
  date: string;
  caseNumber: string;
  dictumLaw: string;
  subject: string;
  parties: { petitioner: string; respondent: string };
  judges: string[];
  sections: string[];
  fullText: string;
  keywords: string[];
};

function guessDate(text: string): string {
  const m = text.match(/\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})\b/);
  return m?.[1] ?? "";
}

function pickFirst(lines: string[], re: RegExp): string {
  const found = lines.find((line) => re.test(line));
  return found ?? "";
}

function extractFromText(raw: string): ExtractedJudgmentFields {
  const fullText = raw.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const lines = fullText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const citation = pickFirst(lines, /\b(PLD|SCMR|CLC|YLR|PTD|CPD|PCRLJ|MLD)\b/i);
  const caseNumber =
    pickFirst(lines, /\b(C\.?P\.?L\.?A?|Crl\.?P\.?L\.?A?|C\.?P\.?|W\.?P\.?|Suit|Appeal)\b/i) ||
    pickFirst(lines, /\bNo\.?\s*[:\-]?\s*[A-Za-z0-9/-]+\b/i);
  const court = pickFirst(lines, /\b(Supreme Court|High Court|District Court|Tribunal|Court)\b/i);

  const vsLine = pickFirst(lines, /\b(vs\.?|versus|v\.)\b/i);
  const parties = (() => {
    if (!vsLine) return { petitioner: "", respondent: "" };
    const parts = vsLine.split(/\b(?:vs\.?|versus|v\.)\b/i);
    return {
      petitioner: (parts[0] ?? "").trim(),
      respondent: (parts[1] ?? "").trim(),
    };
  })();

  const titleCandidates = lines.filter(
    (line) =>
      line.length > 16 &&
      line.length < 180 &&
      !/^page\s+\d+/i.test(line) &&
      !/^\d+$/.test(line),
  );
  const title = titleCandidates[0] ?? "";

  const subject = pickFirst(lines, /\b(Subject|Topic|Area of Law)\b[:\-]/i).replace(
    /\b(Subject|Topic|Area of Law)\b[:\-]?\s*/i,
    "",
  );

  const judgesLine = pickFirst(lines, /\b(Coram|Before)\b[:\-]/i).replace(/\b(Coram|Before)\b[:\-]?\s*/i, "");
  const judges = judgesLine
    ? judgesLine
        .split(/[,;]+/)
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  const dictumLaw = (() => {
    const idx = lines.findIndex((line) => /\b(Held|Dictum|Principle)\b[:\-]/i.test(line));
    if (idx === -1) return "";
    return lines.slice(idx, idx + 3).join(" ").replace(/\s+/g, " ").trim();
  })();

  const sectionLine = pickFirst(lines, /\b(section|u\/s|under section)\b/i);
  const sections = sectionLine
    ? sectionLine
        .split(/[,;]+/)
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  const keywords = [citation, court, subject]
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    citation,
    title,
    court,
    date: guessDate(fullText),
    caseNumber,
    dictumLaw,
    subject,
    parties,
    judges,
    sections,
    fullText,
    keywords,
  };
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return withCors(
        NextResponse.json({ error: "Upload a PDF file under `file`." }, { status: 400 }),
      );
    }
    if (!file.type.includes("pdf")) {
      return withCors(
        NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 }),
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = loadPdfParse();
    const parsed = await pdfParse(buffer);
    const extracted = extractFromText(parsed.text ?? "");

    return withCors(NextResponse.json({ ok: true, extracted }));
  } catch (error) {
    console.error("[reported-judgments/extract]", error);
    return withCors(
      NextResponse.json(
        { error: "Failed to extract PDF text.", detail: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      ),
    );
  }
}
