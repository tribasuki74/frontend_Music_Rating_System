import { useEffect, useState } from "react";
import LayoutUser from "../../components/layout_user";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import { formatDuration } from "../../utils/format_duration";
import { truncateText } from "../../utils/truncate_text";
import { usePlayer } from "../../context/player";
import { Link, useNavigate } from "react-router-dom";
import { TO_PLAY_MUSIC, TO_USER_PROFILE } from "../../utils/paths";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import type { masterDataType } from "../../types/music";
import { STORAGE_S3 } from "../../utils/constant";
import PlayMusicCard from "../../components/play_music_card";

export default function DashboardMainPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [loadingPage, setLoadingPage] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState<masterDataType[]>([]);
  const [recommendation, setRecommendation] = useState<masterDataType[]>([]);

  useEffect(() => {
    if (!user_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        const { data: resRecentlyAdded } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "10",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
            },
          }
        );
        setRecentlyAdded(resRecentlyAdded.data);

        const { data: resRecommendation } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "999999",
              offset: "0",
              is_null_title: "false",
              user_uuid_age_filter: user_uuid,
              user_rating_uuid: user_uuid,
            },
          }
        );
        setRecommendation(resRecommendation.data);
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

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser>
      <div className="h-full mt-2 overflow-hidden lg:mt-0">
        <p className="mb-2 font-bold">Recently Added</p>
        <div className="w-full">
          <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
            {recentlyAdded.map((item, index) => (
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
        </div>

        <div className="flex gap-2">
          <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
            <p className="mb-2 font-bold">Recommendation Music</p>
            <div className="h-[calc(100vh-395px)] overflow-y-auto hide-scrollbar">
              <table className="w-full">
                <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
                  <tr>
                    <td className="pb-2">Title Song</td>
                    <td>Upload By</td>
                    <td>Added</td>
                    <td className="text-nowrap">Duration Song</td>
                  </tr>
                </thead>

                <tbody>
                  {recommendation.map((item, index) => {
                    return (
                      <tr key={index} className="text-xs">
                        <td title={item.title}>
                          <div
                            className="pr-4 cursor-pointer"
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
                              <p className="font-medium text-nowrap">
                                {truncateText(item.title, 40)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="pr-4 text-nowrap">
                          <Link to={`${TO_USER_PROFILE}/${item.user.uuid}`}>
                            {item.user.first_name} {item.user.last_name}
                          </Link>
                        </td>
                        <td className="pr-4 text-nowrap">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-US",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td>{formatDuration(item.duration)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* <div className="p-4 bg-white rounded-lg shadow-md">
            <p className="mb-2 font-bold text-center">
              About Lyric Classification
            </p>
            <div className="bg-[#DBD2FE] w-52 h-52 rounded-lg"></div>
          </div> */}
        </div>
      </div>
    </LayoutUser>
  );
}
