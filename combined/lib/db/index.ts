import { Contract, ContractFilters } from '@/types';

const provider = process.env.DATABASE_PROVIDER ?? 'file';

async function getProvider() {
  if (provider === 'supabase') {
    return import('./supabase');
  }
  return import('./file');
}

export async function getAllContracts(filters?: ContractFilters): Promise<Contract[]> {
  const db = await getProvider();
  return db.getAllContracts(filters);
}

export async function getContractById(id: string): Promise<Contract | null> {
  const db = await getProvider();
  return db.getContractById(id);
}

export async function createContract(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
  const db = await getProvider();
  return db.createContract(data);
}

export async function updateContract(id: string, data: Partial<Contract>): Promise<Contract | null> {
  const db = await getProvider();
  return db.updateContract(id, data);
}

export async function deleteContract(id: string): Promise<boolean> {
  const db = await getProvider();
  return db.deleteContract(id);
}

export async function bulkCreateContracts(items: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Contract[]> {
  const db = await getProvider();
  return db.bulkCreateContracts(items);
}
