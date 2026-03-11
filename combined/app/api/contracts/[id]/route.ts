import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getContractById, updateContract, deleteContract } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const contract = await getContractById(params.id);
  if (!contract) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: contract });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const data = await req.json();
  const updated = await updateContract(params.id, data);
  if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const ok = await deleteContract(params.id);
  if (!ok) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
