import Swal from "sweetalert2";
import LayoutUser from "../../components/layout_user";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Link, useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/player";
import { useEffect, useState } from "react";
import type { masterDataType } from "../../types/music";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import { truncateText } from "../../utils/truncate_text";
import { formatDuration } from "../../utils/format_duration";
import { TO_PLAY_MUSIC, TO_UPLOAD_DETAIL } from "../../utils/paths";
import LoadingSpinner from "../../components/loading";
import { STORAGE_S3 } from "../../utils/constant";
import { deleteData } from "../../components/delete_data";

export default function MyMusicPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [loadingPage, setLoadingPage] = useState(true);
  const [refreshMyMusic, setRefreshMyMusic] = useState(false);
  const [myMusic, setMyMusic] = useState<masterDataType[]>([]);

  useEffect(() => {
    if (!user_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        const { data: resMyMusic } = await AXIOS_INSTANCE.get(`/user_upload`, {
          params: {
            limit: "999999",
            offset: "0",
            user_uuid,
          },
        });
        setMyMusic(resMyMusic.data);
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
  }, [user_uuid, refreshMyMusic]);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser>
      <div className="h-full mt-2 overflow-hidden lg:mt-0">
        <p className="mb-2 font-bold">My Music</p>
        <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
            <table className="w-full">
              <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
                <tr>
                  <td className="pb-2">Title Song</td>
                  <td>Added</td>
                  <td className="px-2 text-nowrap">Duration Song</td>
                  <td className="px-2 text-nowrap">Status</td>
                  <td className="px-2 text-nowrap">Edit</td>
                  <td className="px-2 text-nowrap">Delete</td>
                </tr>
              </thead>

              <tbody>
                {myMusic.map((item, index) => {
                  return (
                    <tr key={index} className="text-xs">
                      <td title={item.title} className="pr-2 text-nowrap">
                        <div
                          className="cursor-pointer"
                          onDoubleClick={() =>
                            navigate(`${TO_PLAY_MUSIC}/${item.uuid}`)
                          }
                          onClick={() =>
                            playTrack(
                              {
                                uuid: item.uuid,
                                title: truncateText(item.title, 30),
                                url: `${STORAGE_S3}/user_uploads/musics/${item.music_filename}`,
                                thumbnail: item.thumbnail_filename,
                                ai_rating_result: item.ai_rating_result,
                                background_color: item.background_color,
                              },
                              true
                            )
                          }
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 bg-[#DBD2FE] rounded overflow-hidden">
                              {item.thumbnail_filename ? (
                                <img
                                  className="object-cover object-center w-full h-full"
                                  src={`${STORAGE_S3}/user_uploads/thumbnails/${item.thumbnail_filename}`}
                                />
                              ) : (
                                <div
                                  style={{
                                    backgroundColor: item.background_color,
                                  }}
                                  className="w-full h-full"
                                ></div>
                              )}
                            </div>
                            <p className="font-medium">
                              {truncateText(item.title, 40)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="pr-2 text-nowrap">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="pr-2 text-nowrap">
                        {formatDuration(item.duration)}
                      </td>
                      <td
                        className="pr-2 text-nowrap"
                        title={item.background_log ?? "N/A"}
                      >
                        {item.background_status ?? "N/A"}
                      </td>
                      <td className="pr-2 text-nowrap">
                        <Link
                          className="text-[#493D9E] font-bold"
                          to={`${TO_UPLOAD_DETAIL}/${item.uuid}`}
                        >
                          Edit Detail
                        </Link>
                      </td>
                      <td
                        className="pr-2 font-bold text-red-500 cursor-pointer text-nowrap"
                        onClick={async () =>
                          await deleteData(
                            `/user_upload?uuid=${item.uuid}`,
                            setRefreshMyMusic,
                            refreshMyMusic
                          )
                        }
                      >
                        Delete Music
                      </td>
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
