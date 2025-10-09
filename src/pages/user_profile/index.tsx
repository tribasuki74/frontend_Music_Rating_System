import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/loading";
import LayoutUser from "../../components/layout_user";
import { STORAGE_S3 } from "../../utils/constant";
import type { userType } from "../../types/user";
import type { genreType } from "../../types/genre";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import type { masterDataType } from "../../types/music";
import { formatDuration } from "../../utils/format_duration";
import { TO_PLAY_MUSIC } from "../../utils/paths";
import { usePlayer } from "../../context/player";
import { truncateText } from "../../utils/truncate_text";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export default function UserProfilePage() {
  const { user_uuid } = useParams<{ user_uuid: string }>();
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid_login = authUser ? authUser.uuid : null;
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [genreData, setGenreData] = useState<genreType[]>([]);
  const [userGenre, setUserGenre] = useState<string[]>([]);
  const [userMusic, setUserMusic] = useState<masterDataType[]>([]);
  const [userData, setUserData] = useState<userType>({
    profile_picture: undefined,
    background_color: "",
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    date_birth: "",
    uuid: "",
    role: "",
    is_active: true,
    user_genres: [],
  });

  useEffect(() => {
    (async () => {
      if (!user_uuid) {
        setLoadingPage(false);
        return;
      }
      try {
        const { data: resGenre } = await AXIOS_INSTANCE.get(`/genre`, {
          params: {
            limit: "999999",
            offset: "0",
          },
        });
        setGenreData(resGenre.data);

        const { data: resUser } = await AXIOS_INSTANCE.get(`/user`, {
          params: {
            uuid: user_uuid,
          },
        });
        const userData = resUser.data[0];
        setUserData(userData);
        setUserGenre(
          userData.user_genres.map(
            (genre: { genre_uuid: string }) => genre.genre_uuid
          )
        );

        const { data: resUserMusic } = await AXIOS_INSTANCE.get(
          `/user_upload/get_by_user_uuid_is_public`,
          {
            params: {
              user_uuid,
              limit: "999999",
              offset: 0,
            },
          }
        );
        setUserMusic(resUserMusic.data);

        const { data: resIsReported } = await AXIOS_INSTANCE.get(
          `/user_report/is_reported`,
          {
            params: {
              reported_user_uuid: user_uuid,
            },
          }
        );
        setIsReported(resIsReported.is_reported);
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

  async function handleReport() {
    if (!user_uuid || isReported) return;
    setLoadingReport(true);
    try {
      const confirmReport = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You will report this user",
        showCancelButton: true,
        confirmButtonText: "Yes, report",
        cancelButtonText: "Cancel",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
      if (!confirmReport.isConfirmed) {
        setLoadingReport(false);
        return;
      }
      await AXIOS_INSTANCE.post(`/user_report`, {
        reported_user_uuid: user_uuid,
      });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Success to report user",
        allowOutsideClick: false,
        didOpen: () => {
          const container = document.querySelector(
            ".swal2-container"
          ) as HTMLElement;
          if (container)
            container.style.zIndex = "99999999999999999999999999999999";
        },
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to report user",
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
      setLoadingReport(false);
    }
  }

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <p className="my-2 font-bold">User Profile</p>
      <div className="px-8 py-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 relative h-12 bg-[#493D9E] rounded-full overflow-hidden flex items-center justify-center">
              {userData.profile_picture ? (
                <img
                  src={`${STORAGE_S3}/user/profile_pictures/${userData.profile_picture}`}
                  className="object-cover object-center w-full h-full"
                />
              ) : (
                <div
                  style={{
                    backgroundColor: userData.background_color,
                  }}
                  className="w-full h-full"
                ></div>
              )}
            </div>

            <div>
              <p className="mb-1 font-bold">
                {userData.first_name} {userData.last_name}
              </p>
              <p>{userData.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {user_uuid !== user_uuid_login && (
              <button
                onClick={handleReport}
                className={`px-4 py-2 font-medium text-white rounded-lg ${
                  isReported ? "bg-gray-400 cursor-not-allowed" : "bg-red-500"
                }`}
                disabled={isReported}
              >
                {loadingReport ? (
                  <LoadingSpinner fullScreen={false} width="20" />
                ) : isReported ? (
                  "Reported"
                ) : (
                  "Report"
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6 lg:gap-10 lg:flex-row">
          <div className="flex flex-col w-full gap-4 lg:gap-10 lg:flex-row">
            <div className="flex flex-col w-full gap-1">
              <label className="font-medium">First Name</label>
              <input
                className="p-1 border border-gray-300 rounded-md"
                value={userData.first_name}
                disabled
              />
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="font-medium">Last Name</label>
              <input
                className="p-1 border border-gray-300 rounded-md"
                value={userData.last_name}
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="font-medium">Email</label>
            <input
              className="p-1 border border-gray-300 rounded-md"
              value={userData.email}
              disabled
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 lg:mt-6 lg:flex-row lg:gap-10">
          <div className="flex flex-col w-full gap-1">
            <label className="font-medium">Username</label>
            <div className="w-full">
              <input
                className="w-full p-1 border border-gray-300 rounded-md"
                value={userData.username}
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="font-medium">Date of Birth</label>
            <input
              className="p-1 border border-gray-300 rounded-md"
              type="date"
              value={userData.date_birth}
              disabled
            />
          </div>
        </div>

        <p className="mt-6 font-medium">Favorite Genre</p>
        <div className="p-3 border border-gray-300 rounded-lg">
          <ul className="flex flex-wrap w-full gap-2">
            {genreData.map(
              (item: { uuid: string; name: string }, index: number) => (
                <li key={index} className="w-36">
                  <input
                    type="checkbox"
                    id={item.uuid.toString()}
                    value={item.uuid}
                    className="hidden peer"
                    disabled
                    checked={userGenre.includes(item.uuid)}
                  />
                  <label
                    htmlFor={item.uuid.toString()}
                    className="inline-flex items-center justify-center w-full px-2 py-1 text-sm text-center text-gray-900 bg-[#DBD2FE] font-semibold rounded-lg peer-checked:bg-[#B2A5FF] peer-checked:border-[#493D9E] peer-checked:border-2"
                  >
                    <p className="text-center">{item.name}</p>
                  </label>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="w-full h-full p-4 mt-4 bg-white rounded-lg shadow-md">
        <p className="mb-2 font-bold">List Music</p>
        <div className="h-[calc(100vh-185px)] overflow-y-auto hide-scrollbar">
          <table className="w-full">
            <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
              <tr>
                <td className="pb-2">Title Song</td>
                <td>Added</td>
                <td className="text-nowrap">Duration Song</td>
              </tr>
            </thead>

            <tbody>
              {userMusic.map((item, index) => {
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
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td>{formatDuration(item.duration)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutUser>
  );
}
