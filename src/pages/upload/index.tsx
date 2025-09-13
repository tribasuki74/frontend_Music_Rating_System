import { IoCloudUploadOutline } from "react-icons/io5";
import LayoutUser from "../../components/layout_user";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/loading";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import { TO_UPLOAD_DETAIL } from "../../utils/paths";

export default function UploadPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

  async function handleUpload(file: File) {
    if (!file || !user_uuid) return;
    setLoadingUpload(true);
    try {
      const { data: resUplData } = await AXIOS_INSTANCE.get(`/user_upload`, {
        params: {
          user_uuid: user_uuid.toString(),
          is_null_title: "true",
        },
      });
      if (resUplData.data.length !== 0) {
        const resSwall = await Swal.fire({
          icon: "warning",
          title: "Incomplete Uploads",
          text: "You have incomplete uploads. Please complete them before uploading new music.",
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
          window.location.href = `${TO_UPLOAD_DETAIL}/${resUplData.data[0].uuid}`;
        }
      }
      const formData = new FormData();
      formData.append("user_uuid", user_uuid);
      formData.append("file", file);
      const { data } = await AXIOS_INSTANCE.post("/user_upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resSwall = await Swal.fire({
        icon: "success",
        title: "Uploaded",
        text: "Your file has been uploaded successfully!",
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
        window.location.href = `${TO_UPLOAD_DETAIL}/${data.uuid}`;
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "warning",
        title: "Failed",
        text: "Failed to upload file",
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
      setLoadingUpload(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!(file.type.startsWith("audio/") || file.type.startsWith("video/"))) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: "Only audio or video files are allowed!",
        });
        return;
      }
      handleUpload(file);
    }
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!(file.type.startsWith("audio/") || file.type.startsWith("video/"))) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: "Only audio or video files are allowed!",
        });
        return;
      }
      handleUpload(file);
    }
  }

  return (
    <LayoutUser>
      <div className="w-screen h-full overflow-hidden lg:w-full">
        <p className="m-2 text-base font-bold">Upload Your Own Music</p>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-205px)] overflow-y-auto hide-scrollbar flex items-center justify-center">
            <div
              className="h-[80%] w-[90%] border-2 border-dashed border-[#B2A5FF] rounded-lg flex flex-col items-center justify-center text-center gap-1 font-semibold text-lg"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              {loadingUpload ? (
                <LoadingSpinner fullScreen={false} />
              ) : (
                <>
                  <IoCloudUploadOutline size={125} className="text-[#B2A5FF]" />
                  <p className="text-[#493D9E]">
                    Drag n drop your music file here
                  </p>
                  <p className="text-[#493D9E]">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#493D9E] text-white rounded-md px-4 py-1"
                  >
                    Browse Files
                  </button>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onFileChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}
