import fs from 'fs';
import path from 'path';
import { Contract, ContractFilters } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTRACTS_FILE = path.join(DATA_DIR, 'contracts.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONTRACTS_FILE)) fs.writeFileSync(CONTRACTS_FILE, JSON.stringify([]));
}

function readContracts(): Contract[] {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(CONTRACTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeContracts(contracts: Contract[]) {
  ensureDataDir();
  fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2));
}

export async function getAllContracts(filters?: ContractFilters): Promise<Contract[]> {
  let contracts = readContracts();
  if (!filters) return contracts;

  const { search, category, status, vendor, agency, yearFrom, yearTo } = filters;

  if (search) {
    const q = search.toLowerCase();
    contracts = contracts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q) ||
        c.agency.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }
  if (category) contracts = contracts.filter((c) => c.category === category);
  if (status) contracts = contracts.filter((c) => c.status === status);
  if (vendor) contracts = contracts.filter((c) => c.vendor.toLowerCase().includes(vendor.toLowerCase()));
  if (agency) contracts = contracts.filter((c) => c.agency.toLowerCase().includes(agency.toLowerCase()));
  if (yearFrom) contracts = contracts.filter((c) => c.year >= yearFrom);
  if (yearTo) contracts = contracts.filter((c) => c.year <= yearTo);

  return contracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getContractById(id: string): Promise<Contract | null> {
  const contracts = readContracts();
  return contracts.find((c) => c.id === id) ?? null;
}

export async function createContract(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
  const contracts = readContracts();
  const now = new Date().toISOString();
  const contract: Contract = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  contracts.push(contract);
  writeContracts(contracts);
  return contract;
}

export async function updateContract(id: string, data: Partial<Contract>): Promise<Contract | null> {
  const contracts = readContracts();
  const idx = contracts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  contracts[idx] = { ...contracts[idx], ...data, updatedAt: new Date().toISOString() };
  writeContracts(contracts);
  return contracts[idx];
}

export async function deleteContract(id: string): Promise<boolean> {
  const contracts = readContracts();
  const filtered = contracts.filter((c) => c.id !== id);
  if (filtered.length === contracts.length) return false;
  writeContracts(filtered);
  return true;
}

export async function bulkCreateContracts(items: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Contract[]> {
  const contracts = readContracts();
  const now = new Date().toISOString();
  const newContracts: Contract[] = items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }));
  writeContracts([...contracts, ...newContracts]);
  return newContracts;
}
