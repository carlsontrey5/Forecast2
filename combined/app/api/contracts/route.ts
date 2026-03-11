import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllContracts, createContract } from '@/lib/db';
import { extractContractFromText, generateSummary } from '@/lib/openai';
import { ContractFilters } from '@/types';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const filters: ContractFilters = {
    search: sp.get('search') ?? undefined,
    category: (sp.get('category') as ContractFilters['category']) ?? undefined,
    status: (sp.get('status') as ContractFilters['status']) ?? undefined,
    vendor: sp.get('vendor') ?? undefined,
    agency: sp.get('agency') ?? undefined,
    yearFrom: sp.get('yearFrom') ? Number(sp.get('yearFrom')) : undefined,
    yearTo: sp.get('yearTo') ? Number(sp.get('yearTo')) : undefined,
  };

  const contracts = await getAllContracts(filters);
  return NextResponse.json({ success: true, data: contracts });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { pressReleaseText, year, ...manualData } = body;

    let contractData;
    if (pressReleaseText) {
      const extracted = await extractContractFromText(pressReleaseText, year ?? new Date().getFullYear());
      const enriched = await generateSummary(extracted);
      contractData = { ...extracted, ...enriched };
    } else {
      contractData = { ...manualData, year: year ?? new Date().getFullYear() };
    }

    const contract = await createContract(contractData);
    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
