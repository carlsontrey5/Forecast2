import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAllContracts } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const contracts = await getAllContracts();
  return <DashboardClient initialContracts={contracts} user={user} />;
}
