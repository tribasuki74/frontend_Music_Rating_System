/* eslint-disable react-hooks/exhaustive-deps */
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import LayoutUser from "../../components/layout_user";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { masterDataType } from "../../types/music";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import { TO_PUBLIC_PLAYLIST, TO_TRENDING_MORE } from "../../utils/paths";
import QueryString from "qs";
import type { myPlaylistType } from "../../types/playlist";
import PlayMusicCard from "../../components/play_music_card";
import PlaylistCard from "../../components/playlist_card";
import type { userType } from "../../types/user";

export default function ExploreSearchPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [viewSearch, setViewSearch] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [userData, setUserData] = useState<userType>();
  const [musicRecentlyAdded, setMusicRecentlyAdded] = useState<
    masterDataType[]
  >([]);
  const [musicTrendingThisMonth, setMusicTrendingThisMonth] = useState<
    masterDataType[]
  >([]);
  const [publicPlaylist, setPublicPlaylist] = useState<myPlaylistType[]>([]);
  const [genreData, setGenreData] = useState<{ name: string; uuid: string }[]>(
    []
  );
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [formSearch, setFormSearch] = useState<string>("");
  const [dataSearch, setDataSearch] = useState<masterDataType[]>([]);

  useEffect(() => {
    if (!user_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        if (!isConfirmAuthenticated) {
          const { data: resUser } = await AXIOS_INSTANCE.get(`/user/uuid`, {
            params: {
              uuid: user_uuid,
            },
          });
          setUserData(resUser);
          setIsConfirmAuthenticated(true);
        }

        const { data: resPublicPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist/get_public_playlist`,
          {
            params: {
              limit: "20",
              offset: "0",
            },
          }
        );
        setPublicPlaylist(resPublicPlaylist.data);

        const { data: resRecentlyAdded } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "20",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
              order_by: "created_at",
            },
          }
        );
        setMusicRecentlyAdded(resRecentlyAdded.data);

        const { data: resTrendingThisMonth } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "20",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
              order_by: "trending_this_month",
            },
          }
        );
        setMusicTrendingThisMonth(resTrendingThisMonth.data);

        const { data: resGenre } = await AXIOS_INSTANCE.get(`/genre`, {
          params: { limit: "999999", offset: "0" },
        });
        setGenreData(resGenre.data);
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to fetch data",
          allowOutsideClick: false,
          didOpen: () => {
            const container = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (container)
              container.style.zIndex = "99999999999999999999999999999999";
          },
        });
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [user_uuid]);

  useEffect(() => {
    if (!user_uuid || loadingPage) return;
    setLoadingSearch(true);
    const debounceTimeout = setTimeout(async () => {
      if (!formSearch && formGenres.length === 0) {
        setViewSearch(false);
        setDataSearch([]);
        setLoadingSearch(false);
        return;
      }
      try {
        const { data: resSearch } = await AXIOS_INSTANCE.get(`/user_upload`, {
          params: {
            limit: "500",
            offset: "0",
            is_null_title: "false",
            user_uuid_age_filter: user_uuid,
            user_rating_uuid: user_uuid,
            genre_uuids: formGenres,
            search: formSearch,
          },
          paramsSerializer: (params) =>
            QueryString.stringify(params, { indices: false }),
        });
        setDataSearch(resSearch.data);
        setViewSearch(true);
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to search data",
          allowOutsideClick: false,
          didOpen: () => {
            const container = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (container)
              container.style.zIndex = "99999999999999999999999999999999";
          },
        });
      } finally {
        setLoadingSearch(false);
      }
    }, 1000);
    return () => clearTimeout(debounceTimeout);
  }, [formSearch, formGenres, user_uuid, loadingPage]);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <div className="relative mb-[200px] lg:mb-[158px] pr-2 z-10">
        <div className="fixed bg-[#F8EFE5] right-3 left-3 lg:left-64">
          <p className="my-2 font-bold">Explore / Discover Music</p>
          <div className="w-full p-4 my-2 bg-white rounded-lg shadow-md">
            <div className="w-full mx-auto">
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only"
              >
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                  <svg
                    className="w-4 h-4 text-[#493D9E]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  className="block w-full p-2 text-sm text-gray-900 rounded-xl ps-10 bg-[#DBD2FE] focus:ring-blue-500 focus:border-blue-500 placeholder:text-[#493D9E]"
                  placeholder="Tap to search..."
                  onChange={(e) => setFormSearch(e.target.value)}
                  required
                />
                {loadingSearch && (
                  <div className="absolute inset-y-0 flex items-center pointer-events-none end-0 ps-3">
                    <LoadingSpinner fullScreen={false} width="20px" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <ul className="flex flex-wrap w-full gap-2">
                {genreData.map(
                  (item: { uuid: string; name: string }, index: number) => (
                    <li key={index}>
                      <input
                        id={item.uuid.toString()}
                        type="checkbox"
                        value={item.uuid}
                        className="hidden peer"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormGenres((prev: string[]) => [
                              ...prev,
                              item.uuid,
                            ]);
                          } else {
                            setFormGenres((prev: string[]) =>
                              prev.filter((uuid) => uuid !== item.uuid)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={item.uuid.toString()}
                        className="inline-flex items-center w-28 lg:w-36 justify-center px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg cursor-pointer peer-checked:bg-[#B2A5FF] hover:bg-[#B2A5FF]"
                      >
                        <p className="text-center">{item.name}</p>
                      </label>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {viewSearch && (
        <div className="w-full p-4 mb-2 bg-white rounded-lg shadow-md">
          <p className="mb-2 text-lg font-bold">Result</p>
          {/* <p className="mb-2 text-lg font-bold">
            Result "{formSearch}"{" "}
            {`${
              formGenres.length !== 0 ? `in ${formGenres.length} Genres` : ""
            }`}
          </p> */}
          {loadingSearch ? (
            <LoadingSpinner fullScreen={false} />
          ) : (
            <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
              {dataSearch.length === 0 ? (
                <p>No music found</p>
              ) : (
                dataSearch.map((item, index) => (
                  <PlayMusicCard
                    key={index}
                    ai_rating_result={item.ai_rating_result}
                    background_color={item.background_color}
                    first_name={item.user.first_name}
                    last_name={item.user.last_name}
                    music_filename={item.music_filename}
                    thumbnail_filename={item.thumbnail_filename}
                    title={item.title}
                    user_uuid={item.user.uuid}
                    uuid={item.uuid}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="w-full p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">Trending This Month</p>
          <Link
            to={`${TO_TRENDING_MORE}/trending_this_month`}
            className="font-semibold text-[#493D9E]"
          >
            View More
          </Link>
        </div>
        <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
          {musicTrendingThisMonth.map((item, index) => (
            <PlayMusicCard
              key={index}
              ai_rating_result={item.ai_rating_result}
              background_color={item.background_color}
              first_name={item.user.first_name}
              last_name={item.user.last_name}
              music_filename={item.music_filename}
              thumbnail_filename={item.thumbnail_filename}
              title={item.title}
              user_uuid={item.user.uuid}
              uuid={item.uuid}
            />
          ))}
        </div>

        <div className="flex mt-4 items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">Recently Added</p>
          <Link
            to={`${TO_TRENDING_MORE}/created_at`}
            className="font-semibold text-[#493D9E]"
          >
            View More
          </Link>
        </div>
        <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
          {musicRecentlyAdded.map((item, index) => (
            <PlayMusicCard
              key={index}
              ai_rating_result={item.ai_rating_result}
              background_color={item.background_color}
              first_name={item.user.first_name}
              last_name={item.user.last_name}
              music_filename={item.music_filename}
              thumbnail_filename={item.thumbnail_filename}
              title={item.title}
              user_uuid={item.user.uuid}
              uuid={item.uuid}
            />
          ))}
        </div>

        <div className="flex mt-4 items-center justify-between mb-2 w-[95%]">
          <p className="text-lg font-bold">Playlist</p>
          <Link
            to={TO_PUBLIC_PLAYLIST}
            className="font-semibold text-[#493D9E]"
          >
            View More
          </Link>
        </div>
        <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
          {publicPlaylist.map((item, index) => (
            <PlaylistCard
              key={index}
              background_color={item.background_color}
              first_name={item.user.first_name}
              last_name={item.user.last_name}
              user_uuid={item.user.uuid}
              playlist_name={item.playlist_name}
              uuid={item.uuid}
            />
          ))}
        </div>
      </div>
    </LayoutUser>
  );
}
