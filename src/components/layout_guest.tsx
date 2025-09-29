import { useEffect, useState, type ReactNode } from "react";
import { TO_DASHBOARD_MAIN } from "../utils/paths";
import LoadingSpinner from "./loading";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";

export default function LayoutGuest({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        window.location.href = TO_DASHBOARD_MAIN;
      } else {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div className="w-screen h-screen overflow-hidden">
      <div className="flex items-center justify-center p-2 m-2 font-bold bg-white rounded-lg shadow-md">
        <p>Lyric Classification</p>
      </div>

      <div>{children}</div>
    </div>
  );
}
