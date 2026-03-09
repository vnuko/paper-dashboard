import { render, screen } from '@testing-library/react';
import DesktopGrid from '../../app/components/DesktopGrid';

// Mock data
const mockServices = [
  {
    id: 'service-1',
    title: 'Service 1',
    description: 'Service descripti',
    url: 'https://service1.com',
    position: 0,
    iconKey: 'icon1.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'service-2',
    title: 'Service 2',
    description: 'Service 2 descripti',
    url: 'https://service2.com',
    position: 1,
    iconKey: 'icon2.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'service-3',
    title: 'Service 3',
    description: 'Service 3 descripti',
    url: 'https://service3.com',
    position: 2,
    iconKey: 'icon3.svg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('DesktopGrid Component', () => {
  test('renders services grid correctly', () => {
    render(<DesktopGrid services={mockServices} />);

    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();

    // Verify that we're showing the services
    mockServices.forEach(service => {
      expect(screen.getByText(service.title)).toBeInTheDocument();
    });
  });

  test('renders maximum 6 services', () => {
    // Create more than 6 services to test the limiter
    const manyServices = Array.from({ length: 10 }, (_, i) => ({
      id: `service-${i}`,
      title: `Service ${i}`,
      description: `Service ${i} description`,
      url: `https://service${i}.com`,
      position: i,
      iconKey: `icon${i}.svg`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    render(<DesktopGrid services={manyServices} />);

    // Only first 6 services should be rendered
    manyServices.slice(0, 6).forEach(service => {
      expect(screen.getByText(service.title)).toBeInTheDocument();
    });

    // Service 7 and beyond should not be rendered
    manyServices.slice(6).forEach(service => {
      expect(screen.queryByText(service.title)).not.toBeInTheDocument();
    });
  });

  test('each link has target set to "_blank"', () => {
    render(<DesktopGrid services={mockServices} />);

    // Query for links using their href value since that's how they're accessible
    mockServices.forEach(service => {
      const link = screen.getByRole('link', {
        name: `${service.title} ${service.title} ${service.description}`,
      });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('href', service.url);
    });
  });
});
