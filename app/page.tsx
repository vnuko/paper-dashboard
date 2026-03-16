import DashboardViewClient from './components/DashboardViewClient';
import { listLinks } from '@/lib/links';

export default async function Home() {
  const links = await listLinks();

  return <DashboardViewClient initialLinks={links} />;
}
