export type UserRole = 'admin' | 'analyst';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export type ContractCategory =
  | 'Contracts'
  | 'Financial Results'
  | 'M&A'
  | 'New Offerings'
  | 'Partnerships';

export type ContractStatus = 'active' | 'expired' | 'pending';

export interface Contract {
  id: string;
  title: string;
  vendor: string;
  agency: string;
  value: number;
  category: ContractCategory;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  description: string;
  summary?: string;
  implications?: string;
  extractedFrom?: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractFilters {
  search?: string;
  category?: ContractCategory | '';
  status?: ContractStatus | '';
  vendor?: string;
  agency?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface PrepopulatePayload {
  historical: boolean;
  startYear: number;
  categories: ContractCategory[];
  maxPerCategoryPerYear: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HeatMapCell {
  year: number;
  category: ContractCategory;
  count: number;
  totalValue: number;
}
