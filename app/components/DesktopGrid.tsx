import ServiceIcon from './ServiceIcon';
import type { Dashboard } from '@prisma/client';

type DashboardMode = 'normal' | 'edit' | 'delete';

type DesktopGridProps = {
  services: Dashboard[];
  mode: DashboardMode;
  onEdit?: (service: Dashboard) => void;
  onDelete?: (service: Dashboard) => void;
};

const DesktopGrid = ({
  services,
  mode = 'normal',
  onEdit,
  onDelete,
}: DesktopGridProps) => {
  return (
    <ul className="desktop-grid" role="grid" aria-label="Dashboard services">
      {services.map(service => (
        <li key={service.id} role="gridcell">
          <ServiceIcon
            service={service}
            mode={mode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
};

export default DesktopGrid;
