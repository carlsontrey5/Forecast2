import { Contract, ContractFilters } from '@/types';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function headers() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: 'return=representation',
  };
}

async function supaFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers as Record<string, string> ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAllContracts(filters?: ContractFilters): Promise<Contract[]> {
  let query = '/contracts?order=created_at.desc';
  if (filters?.search) query += `&or=(title.ilike.*${filters.search}*,vendor.ilike.*${filters.search}*,agency.ilike.*${filters.search}*)`;
  if (filters?.category) query += `&category=eq.${encodeURIComponent(filters.category)}`;
  if (filters?.status) query += `&status=eq.${filters.status}`;
  if (filters?.yearFrom) query += `&year=gte.${filters.yearFrom}`;
  if (filters?.yearTo) query += `&year=lte.${filters.yearTo}`;
  return supaFetch(query);
}

export async function getContractById(id: string): Promise<Contract | null> {
  const data = await supaFetch(`/contracts?id=eq.${id}&limit=1`);
  return data[0] ?? null;
}

export async function createContract(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
  const result = await supaFetch('/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result[0];
}

export async function updateContract(id: string, data: Partial<Contract>): Promise<Contract | null> {
  const result = await supaFetch(`/contracts?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  });
  return result[0] ?? null;
}

export async function deleteContract(id: string): Promise<boolean> {
  await supaFetch(`/contracts?id=eq.${id}`, { method: 'DELETE' });
  return true;
}

export async function bulkCreateContracts(items: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Contract[]> {
  return supaFetch('/contracts', {
    method: 'POST',
    body: JSON.stringify(items),
  });
}
