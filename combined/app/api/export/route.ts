import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllContracts } from '@/lib/db';
import { Contract } from '@/types';

function escapeCSV(val: string | number | undefined): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function contractToRow(c: Contract): string {
  return [
    c.id, c.title, c.vendor, c.agency, c.value, c.category,
    c.status, c.startDate, c.endDate, c.year, c.description,
  ].map(escapeCSV).join(',');
}

const HEADERS = ['ID', 'Title', 'Vendor', 'Agency', 'Value (USD)', 'Category', 'Status', 'Start Date', 'End Date', 'Year', 'Description'].join(',');

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const contracts = await getAllContracts({
    search: sp.get('search') ?? undefined,
    category: (sp.get('category') as never) ?? undefined,
    status: (sp.get('status') as never) ?? undefined,
    yearFrom: sp.get('yearFrom') ? Number(sp.get('yearFrom')) : undefined,
    yearTo: sp.get('yearTo') ? Number(sp.get('yearTo')) : undefined,
  });

  const csv = [HEADERS, ...contracts.map(contractToRow)].join('\n');
  const filename = `contracts_${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
