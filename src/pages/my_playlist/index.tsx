/* eslint-disable react-hooks/exhaustive-deps */
import Swal from "sweetalert2";
import LayoutUser from "../../components/layout_user";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import { TO_MY_PLAYLIST_DETAIL, TO_MY_PLAYLIST_FORM } from "../../utils/paths";
import LoadingSpinner from "../../components/loading";
import { deleteData } from "../../components/delete_data";
import { truncateText } from "../../utils/truncate_text";
import type { myPlaylistType } from "../../types/playlist";
import { FaArrowCircleRight } from "react-icons/fa";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import type { userType } from "../../types/user";

export default function MyPlaylistPage() {
  const navigate = useNavigate();
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const { user_upload_uuid } = useParams<{ user_upload_uuid?: string }>();
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userData, setUserData] = useState<userType>();
  const [loadingInsertPlaylist, setLoadingInsertPlaylist] = useState(false);
  const [refreshMyPlaylist, setRefreshMyPlaylist] = useState(false);
  const [myMusic, setMyPlaylist] = useState<myPlaylistType[]>([]);

  useEffect(() => {
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

        const { data: resMyPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist/get_by_user`,
          {
            params: {
              limit: "999999",
              offset: "0",
            },
          }
        );
        setMyPlaylist(resMyPlaylist.data);
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
  }, [refreshMyPlaylist]);

  async function insertToPlaylist(user_playlist_uuid: string) {
    if (loadingInsertPlaylist || !user_upload_uuid) return;
    setLoadingInsertPlaylist(true);
    try {
      await AXIOS_INSTANCE.post(`/user_playlist_detail`, {
        user_upload_uuid,
        user_playlist_uuid,
      });
      const resSwall = await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Success insert music to playlist.",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
      if (resSwall.isConfirmed) {
        navigate(`${TO_MY_PLAYLIST_DETAIL}/${user_playlist_uuid}`);
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed insert music to playlist",
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
      setLoadingInsertPlaylist(false);
    }
  }

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <div className="h-full mt-2 overflow-hidden lg:mt-0">
        <p className="mb-2 font-bold">My Playlist</p>
        <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
            <div className="text-white font-bold bg-[#493D9E] w-max focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 me-2 mb-4 focus:outline-none">
              <Link to={TO_MY_PLAYLIST_FORM}>Create new playlist</Link>
            </div>

            <table className="w-full">
              <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
                <tr>
                  <td className="pb-2">Playlist Name</td>
                  <td>Visibility</td>
                  <td>Added</td>
                  <td className="px-2 text-center text-nowrap">Music Count</td>
                  <td className="px-2 text-center text-nowrap">
                    Edit Playlist
                  </td>
                  <td className="px-2 text-center text-nowrap">
                    Delete Playlist
                  </td>
                  {user_upload_uuid && (
                    <td className="px-2 text-center text-nowrap">Here</td>
                  )}
                </tr>
              </thead>

              <tbody>
                {myMusic.map((item, index) => {
                  return (
                    <tr key={index} className="text-xs">
                      <td
                        title={item.playlist_name}
                        className="pr-2 text-nowrap"
                      >
                        <Link
                          className="cursor-pointer"
                          to={`${TO_MY_PLAYLIST_DETAIL}/${item.uuid}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 bg-[#DBD2FE] rounded overflow-hidden">
                              <div
                                style={{
                                  backgroundColor: item.background_color,
                                }}
                                className="w-full h-full"
                              ></div>
                            </div>
                            <p className="font-medium">
                              {truncateText(item.playlist_name, 40)}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="pr-2 capitalize text-nowrap">
                        {item.visibility}
                      </td>
                      <td className="pr-2 text-nowrap">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="pr-2 text-center text-nowrap">
                        {item.music_count}
                      </td>
                      <td className="pr-2 text-center text-nowrap">
                        <Link
                          className="text-[#493D9E] font-bold"
                          to={`${TO_MY_PLAYLIST_FORM}/${item.uuid}`}
                        >
                          Edit
                        </Link>
                      </td>
                      <td
                        className="pr-2 font-bold text-center text-red-500 cursor-pointer text-nowrap"
                        onClick={async () =>
                          await deleteData(
                            `/user_playlist?uuid=${item.uuid}`,
                            setRefreshMyPlaylist,
                            refreshMyPlaylist
                          )
                        }
                      >
                        Delete
                      </td>
                      {user_upload_uuid && (
                        <td className="pr-2 text-[#493D9E]">
                          <FaArrowCircleRight
                            size={22}
                            className="m-auto cursor-pointer"
                            onClick={() => insertToPlaylist(item.uuid)}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}
