/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaPause, FaPlay } from "react-icons/fa6";
import {
  IoClose,
  IoHome,
  IoMenu,
  IoPlaySkipBack,
  IoPlaySkipForward,
} from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import {
  TO_ABOUT,
  TO_ACCOUNT,
  TO_DASHBOARD_GUEST,
  TO_DASHBOARD_MAIN,
  TO_EXPLORE_SEARCH,
  TO_MY_MUSIC,
  TO_MY_PLAYLIST,
  TO_PLAY_MUSIC,
  TO_PUBLIC_PLAYLIST,
  TO_RATING,
  TO_RATING_DETAIL,
  TO_TRENDING,
  TO_UPLOAD,
  TO_UPLOAD_DETAIL,
} from "../utils/paths";
import { useEffect, useRef, useState, type ReactNode } from "react";
import LoadingSpinner from "./loading";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { usePlayer } from "../context/player";
import { STORAGE_S3 } from "../utils/constant";
import { formatTime } from "../utils/format_time";
import { truncateText } from "../utils/truncate_text";
import { GoKebabHorizontal } from "react-icons/go";

export default function LayoutUser({
  children,
  isSidebar = true,
}: {
  children: ReactNode;
  isSidebar?: boolean;
}) {
  const { pathname } = useLocation();
  // const isPlayMusic = matchPath(`${TO_PLAY_MUSIC}/:uuid`, pathname);
  // const isRatingDetail = matchPath(`${TO_RATING_DETAIL}/:uuid`, pathname);
  const [loading, setLoading] = useState(true);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isOpenMenuDropdown, setIsOpenMenuDropdown] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playPrev,
    playNext,
    currentTime,
    duration,
    seekTo,
  } = usePlayer();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (!isAuthenticated) {
      (async () => {
        window.location.href = TO_DASHBOARD_GUEST;
      })();
    } else {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    currentTrack?.user_rating,
    currentTrack?.ai_rating_result,
  ]);

  const layout_items = [
    {
      name: "Recommendation",
      link: TO_DASHBOARD_MAIN,
      link_active: [TO_DASHBOARD_MAIN],
    },
    {
      name: "Explore / Discover",
      link: TO_EXPLORE_SEARCH,
      link_active: [TO_EXPLORE_SEARCH, TO_PUBLIC_PLAYLIST],
    },
    {
      name: "Rating & Review",
      link: TO_RATING,
      link_active: [TO_RATING],
    },
    {
      name: "Trending",
      link: TO_TRENDING,
      link_active: [TO_TRENDING],
    },
    {
      name: "Upload Music",
      link: TO_UPLOAD,
      link_active: [TO_UPLOAD, TO_UPLOAD_DETAIL],
    },
    {
      name: "My Music",
      link: TO_MY_MUSIC,
      link_active: [TO_MY_MUSIC],
    },
    {
      name: "My Playlist",
      link: TO_MY_PLAYLIST,
      link_active: [TO_MY_PLAYLIST],
    },
    {
      name: "About & Education",
      link: TO_ABOUT,
      link_active: [TO_ABOUT],
    },
    {
      name: "Account",
      link: TO_ACCOUNT,
      link_active: [TO_ACCOUNT],
    },
  ];

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div className="text-sm">
      <div className="relative overflow-y-hidden">
        <div className="absolute left-0 right-0">
          <div className="flex items-center justify-between p-3 m-2 bg-white rounded-lg shadow-md">
            <Link
              to={TO_DASHBOARD_MAIN}
              className="flex items-center justify-center gap-2 font-bold"
            >
              <IoHome size={18} className="ml-2" />
              {/* {isPlayMusic || isRatingDetail ? (
                <IoHome size={18} className="ml-2" />
              ) : (
                <div className="bg-green-500 rounded-full w-7 h-7"></div>
              )} */}
              Music Classification
            </Link>
            <IoMenu
              className="lg:hidden"
              size={26}
              onClick={() => setIsOpenDrawer(true)}
            />
          </div>
        </div>

        <div className="pt-[58px] pb-[83px] lg:pb-[77px] h-screen grid grid-cols-[auto,1fr] gap-2 lg:mx-2 ml-2">
          {isSidebar && (
            <div className="hidden overflow-auto hide-scrollbar lg:block">
              <ul className="flex flex-col h-full gap-4 p-4 overflow-auto font-semibold bg-white rounded-lg shadow-md hide-scrollbar w-60">
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
          )}

          <div className="w-full overflow-x-hidden overflow-y-auto lg:pr-1 hide-scrollbar">
            {children}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0">
        <div className="grid items-center grid-cols-3 gap-2 px-4 pt-2 m-2 bg-white rounded-lg shadow-md lg:pb-2 lg:px-16">
          <Link
            className="mb-6 lg:mb-0"
            to={`${
              currentTrack?.uuid
                ? `${TO_PLAY_MUSIC}/${currentTrack?.uuid || ""}`
                : pathname
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded shrink-0 bg-[#DBD2FE] overflow-hidden">
                {currentTrack?.thumbnail ? (
                  <img
                    src={`${STORAGE_S3}/user_uploads/thumbnails/${currentTrack?.thumbnail}`}
                    className="object-cover w-full h-full shrink-0"
                  />
                ) : (
                  <div
                    style={{
                      backgroundColor: currentTrack?.background_color,
                    }}
                    className="w-full h-full shrink-0"
                  ></div>
                )}
              </div>
              <p className="text-xs font-bold lg:hidden text-nowrap">
                {truncateText(currentTrack?.title || "No Music", 12)}
              </p>
              <p className="hidden font-bold lg:block text-nowrap">
                {truncateText(currentTrack?.title || "No Music", 30)}
              </p>
            </div>
          </Link>

          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex items-center justify-center lg:mb-0 mb-3 gap-3 text-[#493D9E]">
              <button onClick={playPrev}>
                <IoPlaySkipBack size={16} />
              </button>
              <button
                onClick={() => currentTrack && togglePlay()}
                disabled={!currentTrack}
                className={`p-2 rounded-full ${
                  currentTrack
                    ? "bg-[#DBD2FE] text-[#493D9E] hover:opacity-80"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
              </button>
              <button onClick={playNext}>
                <IoPlaySkipForward size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 w-screen lg:w-[500px]">
              <span className="w-10 text-xs text-right text-gray-600">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-1.5 bg-[#DBD2FE] rounded-full relative cursor-pointer"
                onClick={(e) => {
                  const rect = (
                    e.target as HTMLDivElement
                  ).getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * duration;
                  seekTo(newTime);
                }}
              >
                <div
                  className="h-full bg-[#493D9E] rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="w-10 text-xs text-gray-600">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-end mb-6 text-gray-500 lg:mb-0">
            <GoKebabHorizontal
              size={28}
              className="cursor-pointer"
              onClick={() => setIsOpenMenuDropdown(!isOpenMenuDropdown)}
            />

            <DropdownMenu
              isOpen={isOpenMenuDropdown}
              onClose={() => setIsOpenMenuDropdown(false)}
            >
              <Link
                to={`${TO_RATING_DETAIL}/${currentTrack?.uuid}`}
                className="hover:text-[#493D9E]"
              >
                Rating this music
              </Link>
              <Link
                to={`${TO_MY_PLAYLIST}/${currentTrack?.uuid}`}
                className="hover:text-[#493D9E]"
              >
                Add to playlist
              </Link>
            </DropdownMenu>
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

function DropdownMenu({
  isOpen,
  onClose,
  children,
}: {
  isOpen: any;
  onClose: any;
  children: any;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);
  return (
    <div
      ref={menuRef}
      className={`absolute right-0 -top-24 flex flex-col gap-2 border p-4 space-y-2 font-medium text-black bg-white rounded-lg shadow-md transform transition-all duration-300 origin-top-right ${
        isOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}
