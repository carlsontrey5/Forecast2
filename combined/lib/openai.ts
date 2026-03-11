import { Contract, ContractCategory, ContractStatus } from '@/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL ?? 'gpt-4o-mini';

// ── Rule-based fallback extraction ────────────────────────────────────────────

const IT_VENDORS = [
  'IBM', 'Accenture', 'Leidos', 'SAIC', 'Booz Allen', 'Deloitte',
  'CGI', 'DXC', 'Perspecta', 'ManTech', 'CACI', 'Unison', 'Maximus',
  'Cognizant', 'Infosys', 'Wipro', 'TCS', 'Capgemini', 'Atos',
  'Oracle', 'Microsoft', 'AWS', 'Google', 'Salesforce', 'SAP',
];

const AGENCIES = [
  'DoD', 'Army', 'Navy', 'Air Force', 'DHS', 'IRS', 'VA', 'HHS',
  'CMS', 'NIH', 'DOJ', 'FBI', 'CIA', 'NSA', 'GSA', 'SSA', 'USPS',
  'NASA', 'DOE', 'EPA', 'FEMA', 'DHS', 'State Department',
];

function extractValueFromText(text: string): number {
  const patterns = [
    /\$([0-9,]+(?:\.[0-9]+)?)\s*billion/gi,
    /\$([0-9,]+(?:\.[0-9]+)?)\s*million/gi,
    /\$([0-9,]+(?:\.[0-9]+)?)\s*M\b/gi,
    /\$([0-9,]+(?:\.[0-9]+)?)\s*B\b/gi,
  ];
  for (const p of patterns) {
    const m = p.exec(text);
    if (m) {
      const num = parseFloat(m[1].replace(/,/g, ''));
      return p.source.includes('billion') || p.source.includes('B\\b') ? num * 1_000_000_000 : num * 1_000_000;
    }
  }
  return 0;
}

function detectCategory(text: string): ContractCategory {
  const lower = text.toLowerCase();
  if (lower.includes('acqui') || lower.includes('merger') || lower.includes('m&a')) return 'M&A';
  if (lower.includes('partner') || lower.includes('alliance') || lower.includes('teaming')) return 'Partnerships';
  if (lower.includes('revenue') || lower.includes('earnings') || lower.includes('financial result')) return 'Financial Results';
  if (lower.includes('launch') || lower.includes('new product') || lower.includes('new service') || lower.includes('solution')) return 'New Offerings';
  return 'Contracts';
}

function detectVendor(text: string): string {
  for (const v of IT_VENDORS) {
    if (text.includes(v)) return v;
  }
  return 'Unknown Vendor';
}

function detectAgency(text: string): string {
  for (const a of AGENCIES) {
    if (text.includes(a)) return a;
  }
  return 'Federal Government';
}

function ruleBasedExtract(text: string, year: number): Partial<Contract> {
  return {
    title: text.split('\n')[0].slice(0, 120) || 'Untitled Contract',
    vendor: detectVendor(text),
    agency: detectAgency(text),
    value: extractValueFromText(text),
    category: detectCategory(text),
    status: 'active' as ContractStatus,
    year,
    description: text.slice(0, 500),
    startDate: `${year}-01-01`,
    endDate: `${year + 5}-12-31`,
  };
}

// ── OpenAI extraction ─────────────────────────────────────────────────────────

async function callOpenAI(prompt: string, model = MODEL): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function extractContractFromText(
  text: string,
  year: number
): Promise<Partial<Contract>> {
  if (!OPENAI_API_KEY) return ruleBasedExtract(text, year);

  try {
    const prompt = `Extract IT services contract information from this press release. Return ONLY valid JSON with these keys:
title, vendor, agency, value (number in USD), category (one of: Contracts|Financial Results|M&A|New Offerings|Partnerships), status (active|expired|pending), startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), description (max 300 chars).

Text:
${text.slice(0, 2000)}`;

    const raw = await callOpenAI(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    return { ...JSON.parse(clean), year, extractedFrom: text.slice(0, 500) };
  } catch {
    return ruleBasedExtract(text, year);
  }
}

export async function generateSummary(contract: Partial<Contract>): Promise<{
  summary: string;
  implications: string;
}> {
  if (!OPENAI_API_KEY) {
    return {
      summary: contract.description ?? '',
      implications: 'OpenAI not configured. Set OPENAI_API_KEY for AI-generated insights.',
    };
  }

  try {
    const prompt = `You are an IT services industry analyst. For this contract entry, write:
1. An insightful summary (max 200 words)
2. Market/provider implications (max 100 words)

Return ONLY JSON: { "summary": "...", "implications": "..." }

Contract: ${JSON.stringify(contract)}`;

    const raw = await callOpenAI(prompt, SUMMARY_MODEL);
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { summary: contract.description ?? '', implications: '' };
  }
}
