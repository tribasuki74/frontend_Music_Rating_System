/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/loading";
import LayoutUser from "../../components/layout_user";
import Swal from "sweetalert2";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import type { userType } from "../../types/user";
import {
  ROLE_ADMINISTRATOR,
  ROLE_USER,
  STORAGE_S3,
  ROLE_SUPER_ADMINISTRATOR,
} from "../../utils/constant";
import { truncateText } from "../../utils/truncate_text";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { TO_DASHBOARD_MAIN } from "../../utils/paths";

export default function UserManagementPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSuspend, setLoadingSuspend] = useState(false);
  const [userData, setUserData] = useState<userType>();
  const [refreshUserData, setRefreshUserData] = useState(false);
  const [listUser, setListUser] = useState<userType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!isConfirmAuthenticated) {
          const { data: resUser } = await AXIOS_INSTANCE.get(`/user/uuid`, {
            params: {
              uuid: user_uuid,
            },
          });
          const permittedRoles = [ROLE_SUPER_ADMINISTRATOR, ROLE_ADMINISTRATOR];
          if (!permittedRoles.includes(resUser.role)) {
            window.location.href = TO_DASHBOARD_MAIN;
            return;
          }
          setUserData(resUser);
          setIsConfirmAuthenticated(true);
        }

        const { data: resListUser } = await AXIOS_INSTANCE.get(`/user`, {
          params: {
            limit: "999999",
            offset: "0",
            role: ROLE_USER,
          },
        });
        setListUser(resListUser.data);
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
  }, [refreshUserData]);

  async function handleSuspend(uuid: string, status: boolean) {
    if (loadingSuspend) return;
    setLoadingSuspend(true);
    try {
      await AXIOS_INSTANCE.put(
        `/user/suspend`,
        { is_active: !status },
        { params: { uuid } }
      );
      setRefreshUserData(!refreshUserData);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to suspend account",
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
      setLoadingSuspend(false);
    }
  }

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <div className="h-full mt-2 overflow-hidden lg:mt-0">
        <p className="mb-2 font-bold">User Management</p>
        <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
            <table className="w-full">
              <thead className="text-[#493D9E] font-bold sticky top-0 bg-white">
                <tr>
                  <td className="pb-2">Username</td>
                  <td className="px-2 text-nowrap">Name</td>
                  <td className="px-2 text-nowrap">Email</td>
                  <td className="px-2 text-center text-nowrap">
                    User Reported
                  </td>
                  <td className="px-2 text-center text-nowrap">Status</td>
                  <td className="px-2 text-center text-nowrap">Suspend</td>
                </tr>
              </thead>

              <tbody>
                {listUser.map((item, index) => {
                  return (
                    <tr key={index} className="text-xs">
                      <td title={item.username} className="pr-2 text-nowrap">
                        <div className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 bg-[#DBD2FE] rounded overflow-hidden">
                              {item.profile_picture ? (
                                <img
                                  className="object-cover object-center w-full h-full"
                                  src={`${STORAGE_S3}/user/profile_pictures/${item.profile_picture}`}
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
                              {truncateText(item.username, 40)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="pr-2 text-nowrap">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="pr-2 text-nowrap">{item.email}</td>
                      <td className="pr-2 text-center text-nowrap">
                        {index + 2}
                      </td>
                      <td className="pr-2 text-center text-nowrap">
                        {item.is_active ? "Active" : "Suspend"}
                      </td>
                      <td
                        className={`pr-2 font-bold cursor-pointer text-nowrap text-center ${
                          item.is_active ? "text-red-500" : "text-blue-500"
                        }`}
                        onClick={() => handleSuspend(item.uuid, item.is_active)}
                      >
                        {item.is_active ? "Suspend" : "Unsuspend"}
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
