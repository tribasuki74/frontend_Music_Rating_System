import { useEffect, useState } from "react";
import LayoutGuestDashboard from "../../components/layout_guest_dashboard";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import { Link } from "react-router-dom";
import { TO_LOGIN } from "../../utils/paths";
import { formatDuration } from "../../utils/format_duration";
import { truncateText } from "../../utils/truncate_text";
import type { masterDataType } from "../../types/music";
import { STORAGE_S3 } from "../../utils/constant";

export default function DashboardGuestPage() {
  const [loadingPage, setLoadingPage] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState<masterDataType[]>([]);
  const [recommendation, setRecommendation] = useState<masterDataType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: resRecentlyAdded } = await AXIOS_INSTANCE.get(
          `/user_upload`,
          {
            params: {
              limit: "10",
              offset: "0",
              is_null_title: "false",
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
  }, []);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutGuestDashboard>
      <div className="h-full overflow-hidden">
        <p className="mb-2 font-bold">Recently Added</p>
        <div className="w-full">
          <div className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar">
            {recentlyAdded.map((item, index) => {
              let ageLabel = "";
              if (item.ai_rating_result === "13+") {
                ageLabel = "13.png";
              } else if (item.ai_rating_result === "17+") {
                ageLabel = "17.png";
              } else if (item.ai_rating_result === "21+") {
                ageLabel = "21.png";
              } else {
                ageLabel = "SU.png";
              }

              return (
                <Link
                  key={index}
                  className="cursor-pointer w-28"
                  title={`${item.title} - Upload By ${item.user.first_name} ${item.user.last_name}`}
                  to={TO_LOGIN}
                >
                  <div className="bg-[#DBD2FE] relative w-28 h-28 shrink-0 rounded-lg shadow-md overflow-hidden">
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

                    {ageLabel && (
                      <img
                        src={`/label_rating/${ageLabel}`}
                        className="absolute top-0 right-0 w-72"
                      />
                    )}
                  </div>

                  <p className="mx-1 mt-1 text-xs font-semibold">
                    {truncateText(item.title, 22)}
                  </p>
                  <p className="mx-1 text-xs font-semibold text-gray-500">
                    {truncateText(
                      `${item.user.first_name} ${item.user.last_name}`,
                      15
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
            <p className="mb-2 font-bold">Recommendation Music</p>
            <div className="h-[calc(100vh-335px)] overflow-y-auto hide-scrollbar">
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
                  {recommendation.map((item, index) => (
                    <tr key={index} className="text-xs">
                      <td title={item.title}>
                        <Link to={TO_LOGIN}>
                          <div className="flex items-center gap-2 mb-2 mr-4">
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
                        </Link>
                      </td>
                      <td className="pr-4 text-nowrap">
                        {item.user.first_name} {item.user.last_name}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* <div className="p-4 bg-white rounded-lg shadow-md">
            <p className="mb-2 font-bold text-center">Account</p>
            <div className="flex flex-col gap-2">
              <div className="bg-[#DBD2FE] w-48 h-40 rounded-lg"></div>
              <div className="bg-[#DBD2FE] w-48 h-40 rounded-lg"></div>
            </div>
          </div> */}
        </div>
      </div>
    </LayoutGuestDashboard>
  );
}
