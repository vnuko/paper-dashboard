import DashboardViewClient from './components/DashboardViewClient';
import { listServices } from '@/lib/services';

export default async function Home() {
  const services = await listServices();

  return <DashboardViewClient initialServices={services} />;
}
