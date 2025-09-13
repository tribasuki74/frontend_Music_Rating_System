import Swal from "sweetalert2";
import LayoutUser from "../../components/layout_user";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePlayer } from "../../context/player";
import { useEffect, useState } from "react";
import type { masterDataType } from "../../types/music";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import { truncateText } from "../../utils/truncate_text";
import { formatDuration } from "../../utils/format_duration";
import { TO_PLAY_MUSIC, TO_USER_PROFILE } from "../../utils/paths";
import LoadingSpinner from "../../components/loading";
import { STORAGE_S3 } from "../../utils/constant";

export default function PublicPlaylistDetailPage() {
  const { user_playlist_uuid } = useParams<{ user_playlist_uuid: string }>();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [loadingPage, setLoadingPage] = useState(true);
  const [playlistName, setPlaylistName] = useState("");
  const [myMusic, setMyMusic] = useState<
    { uuid: string; user_upload: masterDataType }[]
  >([]);

  useEffect(() => {
    if (!user_playlist_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        const { data: resMyPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist/get_public_playlist_by_uuid`,
          { params: { uuid: user_playlist_uuid } }
        );
        setPlaylistName(resMyPlaylist.playlist_name);

        const { data: resMyMusicPlaylist } = await AXIOS_INSTANCE.get(
          `/user_playlist_detail/get_by_user_playlist`,
          {
            params: {
              limit: "999999",
              offset: "0",
              user_playlist_uuid: resMyPlaylist.uuid,
            },
          }
        );
        setMyMusic(resMyMusicPlaylist.data);
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
  }, [user_playlist_uuid]);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser>
      <div className="h-full mt-2 overflow-hidden lg:mt-0">
        <p className="mb-2 font-bold">{playlistName}</p>
        <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
            <table className="w-full">
              <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
                <tr>
                  <td className="pb-2">Title Song</td>
                  <td>Upload By</td>
                  <td>Added</td>
                  <td className="px-2 text-center text-nowrap">
                    Duration Song
                  </td>
                </tr>
              </thead>

              <tbody>
                {myMusic.map((item) => {
                  return (
                    <tr className="text-xs">
                      <td className="pr-2 text-nowrap">
                        <div
                          className="flex items-center gap-2 mb-2 cursor-pointer"
                          title={item.user_upload.title}
                          onDoubleClick={() =>
                            navigate(
                              `${TO_PLAY_MUSIC}/${item.user_upload.uuid}`
                            )
                          }
                          onClick={() =>
                            playTrack(
                              {
                                uuid: item.user_upload.uuid,
                                title: truncateText(item.user_upload.title, 30),
                                url: `${STORAGE_S3}/user_uploads/musics/${item.user_upload.music_filename}`,
                                thumbnail: item.user_upload.thumbnail_filename,
                                ai_rating_result:
                                  item.user_upload.ai_rating_result,
                                background_color:
                                  item.user_upload.background_color,
                              },
                              true
                            )
                          }
                        >
                          <div className="w-9 h-9 bg-[#DBD2FE] rounded overflow-hidden">
                            {item.user_upload.thumbnail_filename ? (
                              <img
                                className="object-cover object-center w-full h-full"
                                src={`${STORAGE_S3}/user_uploads/thumbnails/${item.user_upload.thumbnail_filename}`}
                              />
                            ) : (
                              <div
                                style={{
                                  backgroundColor:
                                    item.user_upload.background_color,
                                }}
                                className="w-full h-full"
                              ></div>
                            )}
                          </div>
                          <p className="font-medium">
                            {truncateText(item.user_upload.title, 40)}
                          </p>
                        </div>
                      </td>
                      <td className="pr-4 text-nowrap">
                        <Link
                          to={`${TO_USER_PROFILE}/${item.user_upload.user.uuid}`}
                        >
                          {item.user_upload.user.first_name}{" "}
                          {item.user_upload.user.last_name}
                        </Link>
                      </td>
                      <td className="pr-4 text-nowrap">
                        {new Date(
                          item.user_upload.created_at
                        ).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="pr-2 text-center text-nowrap">
                        {formatDuration(item.user_upload.duration)}
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
