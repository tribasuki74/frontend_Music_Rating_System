/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import LayoutUser from "../../components/layout_user";
import LoadingSpinner from "../../components/loading";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Swal from "sweetalert2";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import type { masterDataType } from "../../types/music";
import { TO_PLAY_MUSIC } from "../../utils/paths";
import { Link } from "react-router-dom";
import { truncateText } from "../../utils/truncate_text";
import {
  ROLE_ADMINISTRATOR,
  ROLE_SUPER_ADMINISTRATOR,
} from "../../utils/constant";
import type { userType } from "../../types/user";

export default function RatingPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userData, setUserData] = useState<userType>();
  const [userRating, setUserRating] = useState<
    { rating: string; reason: string; user_upload: masterDataType }[]
  >([]);

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

        const { data: resUserData } = await AXIOS_INSTANCE.get(`/user`, {
          params: { uuid: user_uuid },
        });
        const userRole = resUserData.data[0].role;
        if (
          userRole === ROLE_SUPER_ADMINISTRATOR ||
          userRole === ROLE_ADMINISTRATOR
        ) {
          const { data: resUserRating } = await AXIOS_INSTANCE.get(
            `/user_rating`,
            {
              params: {
                limit: "999999",
              },
            }
          );
          setUserRating(resUserRating.data);
        } else {
          const { data: resUserRating } = await AXIOS_INSTANCE.get(
            `/user_rating`,
            {
              params: {
                limit: "999999",
                user_uuid,
              },
            }
          );
          setUserRating(resUserRating.data);
        }
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
    <LayoutUser userData={userData!}>
      <div className="h-full overflow-hidden">
        <p className="m-2 text-base font-bold">Rating & Review</p>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-205px)] overflow-y-auto hide-scrollbar">
            <table className="w-full">
              <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
                <tr className="bg-[#DBD2FE]">
                  <td className="p-2">No</td>
                  <td className="px-2 text-nowrap">Title Song</td>
                  <td className="px-2 text-nowrap">Music Link</td>
                  <td className="px-2 text-nowrap">System Rating</td>
                  <td className="px-2 text-nowrap">User Rating</td>
                  <td className="px-2 text-nowrap">Reason</td>
                </tr>
              </thead>

              <tbody>
                {userRating.map((item, index) => (
                  <tr key={index} className="text-xs">
                    <td className="py-2 pr-2 text-center text-nowrap">
                      {index + 1}
                    </td>
                    <td
                      className="pr-2 font-medium text-nowrap"
                      title={item.user_upload.title}
                    >
                      {truncateText(item.user_upload.title, 25)}
                    </td>
                    <td className="pr-2 text-nowrap">
                      <Link
                        to={`${TO_PLAY_MUSIC}/${item.user_upload.uuid}`}
                        target="_blank"
                      >
                        {truncateText(
                          `${window.location.origin}
                        ${TO_PLAY_MUSIC}/${item.user_upload.uuid}`,
                          60
                        )}
                      </Link>
                    </td>
                    <td className="pr-2 text-nowrap">
                      {item.user_upload.ai_rating_result}
                    </td>
                    <td className="pr-2 text-nowrap">{item.rating}</td>
                    <td className="pr-2 text-nowrap" title={item.reason}>
                      {truncateText(item.reason, 20)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}
