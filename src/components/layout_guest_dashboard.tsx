import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  TO_ABOUT,
  TO_DASHBOARD_GUEST,
  TO_DASHBOARD_MAIN,
  TO_EXPLORE_SEARCH,
  TO_LOGIN,
  TO_MY_MUSIC,
  TO_MY_PLAYLIST,
  TO_RATING,
  TO_TRENDING,
  TO_UPLOAD,
  TO_UPLOAD_DETAIL,
} from "../utils/paths";
import LoadingSpinner from "./loading";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { IoClose, IoMenu } from "react-icons/io5";

export default function LayoutGuestDashboard({
  children,
}: {
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(true);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        window.location.href = TO_DASHBOARD_MAIN;
      } else {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const layout_items = [
    {
      name: "Recommendation",
      link: TO_DASHBOARD_GUEST,
      link_active: [TO_DASHBOARD_GUEST],
    },
    {
      name: "Explore / Discover",
      link: TO_LOGIN,
      link_active: [TO_EXPLORE_SEARCH],
    },
    {
      name: "Rating & Review",
      link: TO_LOGIN,
      link_active: [TO_RATING],
    },
    {
      name: "Trending",
      link: TO_LOGIN,
      link_active: [TO_TRENDING],
    },
    {
      name: "Upload Music",
      link: TO_LOGIN,
      link_active: [TO_UPLOAD, TO_UPLOAD_DETAIL],
    },
    {
      name: "My Music",
      link: TO_LOGIN,
      link_active: [TO_MY_MUSIC],
    },
    {
      name: "My Playlist",
      link: TO_LOGIN,
      link_active: [TO_MY_PLAYLIST],
    },
    {
      name: "About & Education",
      link: TO_LOGIN,
      link_active: [TO_ABOUT],
    },
    {
      name: "Login",
      link: TO_LOGIN,
      link_active: [TO_LOGIN],
    },
  ];

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div className="text-sm">
      <div className="relative overflow-y-hidden">
        <div className="absolute left-0 right-0">
          <div className="flex items-center justify-between p-3 m-2 text-lg font-bold bg-white rounded-lg shadow-md lg:justify-center">
            <p>Lyric Classification</p>
            <IoMenu
              className="lg:hidden"
              size={28}
              onClick={() => setIsOpenDrawer(true)}
            />
          </div>
        </div>

        <div className="pt-[68px] pb-2 h-screen">
          <div className="grid grid-cols-[auto,1fr] gap-2 mx-2 h-full">
            <div className="hidden overflow-auto lg:block">
              <ul className="flex flex-col h-full gap-4 p-4 overflow-auto font-semibold bg-white rounded-lg shadow-md w-60">
                {layout_items.map((item, index) => (
                  <li key={index}>
                    <Link
                      className={`hover:text-[#493D9E] hover:font-bold ${
                        item.link_active.some((l) =>
                          l === "/" ? pathname === l : pathname.startsWith(l)
                        )
                          ? "text-[#493D9E] font-bold"
                          : ""
                      }`}
                      to={item.link}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-full pr-1 overflow-x-hidden overflow-y-auto hide-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpenDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <p className="text-lg font-bold">Menu</p>
          <IoClose
            className="cursor-pointer"
            size={26}
            onClick={() => setIsOpenDrawer(false)}
          />
        </div>
        <ul className="flex flex-col gap-4 p-4 font-semibold">
          {layout_items.map((item, index) => (
            <li key={index}>
              <Link
                className={`block hover:text-[#493D9E] hover:font-bold ${
                  item.link_active.some((l) =>
                    l === "/" ? pathname === l : pathname.startsWith(l)
                  )
                    ? "text-[#493D9E] font-bold"
                    : ""
                }`}
                to={item.link}
                onClick={() => setIsOpenDrawer(false)}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {isOpenDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={() => setIsOpenDrawer(false)}
        />
      )}
    </div>
  );
}
