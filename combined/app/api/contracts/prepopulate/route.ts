import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { bulkCreateContracts } from '@/lib/db';
import { generateHistoricalContracts } from '@/lib/historical';
import { ContractCategory, PrepopulatePayload } from '@/types';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body: PrepopulatePayload = await req.json();
    const { startYear = 2010, categories, maxPerCategoryPerYear = 2 } = body;

    const validCategories: ContractCategory[] = [
      'Contracts', 'Financial Results', 'M&A', 'New Offerings', 'Partnerships',
    ];
    const cats = (categories ?? validCategories).filter((c) => validCategories.includes(c));

    const items = generateHistoricalContracts(startYear, cats, maxPerCategoryPerYear);
    const created = await bulkCreateContracts(items);

    return NextResponse.json({ success: true, data: { count: created.length } });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
