import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

const DashboardNavContext = createContext(null);

export function DashboardNavProvider({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  /* Collapse drawer when moving to desktop width (drawer is mobile-only) */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1025px)");
    const onChange = () => {
      if (mq.matches) {
        setDrawerOpen(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const syncBody = () => {
      if (drawerOpen && mq.matches) {
        document.body.classList.add("dashboard-drawer-open");
      } else {
        document.body.classList.remove("dashboard-drawer-open");
      }
    };
    syncBody();
    mq.addEventListener("change", syncBody);
    return () => {
      mq.removeEventListener("change", syncBody);
      document.body.classList.remove("dashboard-drawer-open");
    };
  }, [drawerOpen]);

  const value = useMemo(
    () => ({
      drawerOpen,
      setDrawerOpen,
      closeDrawer,
      toggleDrawer,
    }),
    [drawerOpen, closeDrawer, toggleDrawer]
  );

  return (
    <DashboardNavContext.Provider value={value}>
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  return useContext(DashboardNavContext);
}
