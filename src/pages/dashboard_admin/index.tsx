/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/loading";
import LayoutUser from "../../components/layout_user";
import type { userType } from "../../types/user";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";

export default function DashboardAdminPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userData, setUserData] = useState<userType>();

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
      <div></div>
    </LayoutUser>
  );
}
