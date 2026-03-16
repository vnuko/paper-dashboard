'use client';

import { useRef, useEffect, useState } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import clamp from 'lodash.clamp';
import type { DashboardInfo } from './DashboardSelect';
import type { Link } from '@prisma/client';

interface DashboardSwitcherProps {
  dashboards: DashboardInfo[];
  selectedDashboardId: string | null;
  onSelectDashboard: (id: string) => void;
  linksByDashboard: Record<string, Link[]>;
  children: React.ReactNode;
}

const DashboardSwitcher = ({
  dashboards,
  selectedDashboardId,
  onSelectDashboard,
  linksByDashboard,
  children,
}: DashboardSwitcherProps) => {
  const index = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (selectedDashboardId && dashboards.length > 0) {
      const idx = dashboards.findIndex(d => d.id === selectedDashboardId);
      if (idx !== -1) {
        index.current = idx;
        api.start(i => ({
          x: (i - idx) * width,
          display: 'block',
        }));
      }
    }
  }, [selectedDashboardId, dashboards.length, width]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const [props, api] = useSprings(dashboards.length, i => ({
    x: i * width,
    display: 'block',
  }));

  useEffect(() => {
    api.start(i => ({
      x: (i - index.current) * width,
      display: 'block',
    }));
  }, [width, dashboards.length]);

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], cancel }) => {
      if (dashboards.length <= 1) return;

      if (active && Math.abs(mx) > width / 4) {
        const newIndex = clamp(
          index.current + (xDir > 0 ? -1 : 1),
          0,
          dashboards.length - 1
        );
        index.current = newIndex;
        onSelectDashboard(dashboards[newIndex].id);
        cancel();
      }

      api.start(i => {
        if (i < index.current - 1 || i > index.current + 1) {
          return { display: 'none' };
        }
        const x = (i - index.current) * width + (active ? mx : 0);
        return { x, display: 'block' };
      });
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  );

  const handleIconClick = (idx: number) => {
    if (idx === index.current) return;
    index.current = idx;
    onSelectDashboard(dashboards[idx].id);
    api.start(i => ({
      x: (i - idx) * width,
      display: 'block',
    }));
  };

  const getCurrentIndex = () => {
    if (!selectedDashboardId) return 0;
    return dashboards.findIndex(d => d.id === selectedDashboardId) || 0;
  };

  return (
    <div className="dashboard-switcher-container">
      <div className="dashboard-switcher-icons">
        {dashboards.map((dashboard, idx) => (
          <button
            key={dashboard.id}
            className={`dashboard-switcher-icon ${
              selectedDashboardId === dashboard.id ? 'active' : ''
            }`}
            onClick={() => handleIconClick(idx)}
            aria-label={`Switch to ${dashboard.title}`}
            title={dashboard.title}
          >
            <i className="fas fa-desktop"></i>
          </button>
        ))}
      </div>

      <div ref={containerRef} className="dashboard-switcher-content">
        {props.map(({ x, display }, i) => (
          <animated.div
            {...(dashboards.length > 1 ? bind() : {})}
            key={dashboards[i]?.id || i}
            className="dashboard-switcher-page"
            style={{
              display,
              x,
              touchAction: 'pan-y',
            }}
          >
            {i === getCurrentIndex() ? (
              children
            ) : (
              <div className="dashboard-switcher-placeholder">
                <div className="desktop-grid">
                  {linksByDashboard[dashboards[i]?.id]?.map(link => (
                    <div key={link.id} className="desktop-grid__tile">
                      <div className="icon-wrapper">
                        <img
                          src={`/icons/${link.iconKey || 'papirus/places/bookmark-missing.svg'}`}
                          alt={link.title}
                          className="service-icon"
                        />
                      </div>
                      <div className="desktop-grid__label">
                        <span>{link.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </animated.div>
        ))}
      </div>

      <style jsx>{`
        .dashboard-switcher-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .dashboard-switcher-icons {
          position: fixed;
          top: 1rem;
          left: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 100;
        }

        .dashboard-switcher-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(215, 227, 244, 0.4);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dashboard-switcher-icon:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .dashboard-switcher-icon.active {
          color: #d7e3f4;
          opacity: 1;
          border-color: rgba(124, 226, 255, 0.3);
          background: rgba(124, 226, 255, 0.1);
        }

        .dashboard-switcher-content {
          position: relative;
          flex: 1;
          overflow: hidden;
        }

        .dashboard-switcher-page {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          will-change: transform;
        }

        .dashboard-switcher-placeholder {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default DashboardSwitcher;
