'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { DashboardInfo } from './DashboardSelect';
import type { Link } from '@prisma/client';
import DesktopGrid, { DashboardMode } from './DesktopGrid';

interface DashboardSwitcherProps {
  dashboards: DashboardInfo[];
  selectedDashboardId: string | null;
  onSelectDashboard: (id: string) => void;
  linksByDashboard: Record<string, Link[]>;
  mode: DashboardMode;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  onReorder: (newOrder: Link[]) => void;
}

const DashboardSwitcher = ({
  dashboards,
  selectedDashboardId,
  onSelectDashboard,
  linksByDashboard,
  mode,
  onEdit,
  onDelete,
  onReorder,
}: DashboardSwitcherProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isScrolling = useRef(false);

  // Find index from selectedDashboardId
  useEffect(() => {
    if (selectedDashboardId && dashboards.length > 0) {
      const idx = dashboards.findIndex(d => d.id === selectedDashboardId);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
        scrollToSlide(idx);
      }
    }
  }, [selectedDashboardId, dashboards]);

  // Scroll to specific slide
  const scrollToSlide = useCallback((index: number) => {
    if (!containerRef.current) return;

    const slideWidth = containerRef.current.offsetWidth;
    isScrolling.current = true;

    containerRef.current.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth',
    });

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrolling.current = false;
    }, 400);
  }, []);

  // Handle scroll events to sync state
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrolling.current) return;

    const scrollLeft = containerRef.current.scrollLeft;
    const slideWidth = containerRef.current.offsetWidth;

    if (slideWidth === 0) return;

    const newIndex = Math.round(scrollLeft / slideWidth);

    if (newIndex !== currentIndex && dashboards[newIndex]) {
      setCurrentIndex(newIndex);
      onSelectDashboard(dashboards[newIndex].id);
    }
  }, [currentIndex, dashboards, onSelectDashboard]);

  // Handle click on switcher icon
  const handleIconClick = (idx: number) => {
    if (idx === currentIndex) return;
    setCurrentIndex(idx);
    onSelectDashboard(dashboards[idx].id);
    scrollToSlide(idx);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (dashboards.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newIndex = Math.max(0, currentIndex - 1);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          onSelectDashboard(dashboards[newIndex].id);
          scrollToSlide(newIndex);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newIndex = Math.min(dashboards.length - 1, currentIndex + 1);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          onSelectDashboard(dashboards[newIndex].id);
          scrollToSlide(newIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, dashboards, onSelectDashboard, scrollToSlide]);

  return (
    <>
      <div
        className="dashboard-switcher-icons"
        role="tablist"
        aria-label="Dashboard switcher"
      >
        {dashboards.map((dashboard, idx) => (
          <button
            key={dashboard.id}
            role="tab"
            aria-selected={selectedDashboardId === dashboard.id}
            aria-controls={`slide-${dashboard.id}`}
            className={`dashboard-switcher-icon ${
              selectedDashboardId === dashboard.id ? 'active' : ''
            }`}
            onClick={() => handleIconClick(idx)}
            aria-label={`Switch to ${dashboard.title}`}
            title={dashboard.title}
          >
            <i className="fas fa-desktop" aria-hidden="true"></i>
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="slide-container"
        onScroll={handleScroll}
        role="region"
        aria-label="Dashboard workspace"
      >
        {dashboards.map(dashboard => {
          const links = linksByDashboard[dashboard.id] || [];

          return (
            <section
              key={dashboard.id}
              id={`slide-${dashboard.id}`}
              className="slide"
              role="tabpanel"
              aria-labelledby={`tab-${dashboard.id}`}
              aria-hidden={selectedDashboardId !== dashboard.id}
            >
              <div className="page-container">
                {links.length === 0 ? (
                  <div className="empty-state-container">
                    <div className="empty-state-content">
                      <p className="empty-state-description">
                        This dashboard is empty. Add your first link.
                      </p>
                    </div>
                  </div>
                ) : (
                  <DesktopGrid
                    links={links}
                    mode={mode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReorder={onReorder}
                  />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
};

export default DashboardSwitcher;
