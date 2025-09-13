import type { Dispatch, SetStateAction } from "react";
import Swal from "sweetalert2";
import AXIOS_INSTANCE from "../utils/axios_instance";

export async function deleteData(
  path: string,
  setHitApi?: Dispatch<SetStateAction<boolean>>,
  hitApi?: boolean
) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Are you sure you want to delete this data, you will not be able to restore it!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete!",
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

  if (result.isConfirmed) {
    try {
      await AXIOS_INSTANCE.delete(path);
      if (setHitApi) {
        setHitApi(!hitApi);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
