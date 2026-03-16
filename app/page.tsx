import DashboardViewClient from './components/DashboardViewClient';
import { listLinks } from '@/lib/links';
import { listDashboards, ensureDefaultDashboard } from '@/lib/dashboards';

export default async function Home() {
  await ensureDefaultDashboard();

  const [links, dashboards] = await Promise.all([
    listLinks(),
    listDashboards(),
  ]);

  return (
    <DashboardViewClient
      initialLinks={links}
      initialDashboards={dashboards.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
      }))}
    />
  );
}
