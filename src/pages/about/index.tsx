import { useEffect, useState } from "react";
import LayoutUser from "../../components/layout_user";
import type { userType } from "../../types/user";
import LoadingSpinner from "../../components/loading";
import Swal from "sweetalert2";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export default function AboutEducationPage() {
  const [loadingPage, setLoadingPage] = useState(true);
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [userData, setUserData] = useState<userType>();

  useEffect(() => {
    (async () => {
      try {
        const { data: resUser } = await AXIOS_INSTANCE.get(`/user/uuid`, {
          params: {
            uuid: user_uuid,
          },
        });
        setUserData(resUser);
      } catch (error) {
        console.log(error);
        const resSwal = await Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to fetch user data",
          allowOutsideClick: false,
          didOpen: () => {
            const container = document.querySelector(
              ".swal2-container"
            ) as HTMLElement;
            if (container)
              container.style.zIndex = "99999999999999999999999999999999";
          },
        });
        if (resSwal.isConfirmed) window.location.reload();
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
        <p className="m-2 text-base font-bold">About & Education</p>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="h-[calc(100vh-205px)] lg:w-[92%] lg:pl-6 overflow-y-auto hide-scrollbar text-justify">
            <h2 className="mb-1 font-bold">About Us</h2>
            <p className="mb-2">
              This project is the culmination of two months of dedicated
              research and development, resulting in an automated music rating
              classification system. We have combined artificial intelligence
              with musicology to create a platform that not only classifies
              genres but also provides a relevant age rating for every song.
            </p>

            <h2 className="mt-4 mb-1 font-bold">Education</h2>
            <p className="mb-2">
              This platform is built on a foundation of scientific research and
              advanced technology. This page is designed to explain how our
              system works, from raw audio to the final classification result.
            </p>
            <p className="mb-1 ml-4 font-bold">
              1. Data Collection and Processing
            </p>
            <p className="mb-2 ml-4">
              We began our process by collecting data from YouTube. This
              involved using the YouTube V3 API to search for music videos and
              YT-DLP to download them. We ensured the data we collected was
              clean and relevant by filtering out videos that were too short or
              too long.
            </p>
            <p className="mb-1 ml-4 font-bold">2. Feature Extraction</p>
            <p className="mb-2 ml-4">
              Instead of training our AI directly with raw audio files, we
              transformed them into a format that our models could understand
              more easily. We used two types of features:
            </p>
            <p className="mb-2 ml-7">
              <span className="font-bold">• Mel-Spectrogram:</span> We used the
              Librosa library to convert a song's audio into a 2D image called a
              Mel-Spectrogram. This image displays the patterns of frequency
              (pitch) and intensity over time, providing a visual representation
              of the song's melody and harmony.
            </p>
            <p className="mb-2 ml-7">
              <span className="font-bold">• Song Lyrics:</span> We also
              considered lyrics a crucial feature. Using the Faster-Whisper
              transcription model, we automatically extracted the lyrics from
              the audio. This allowed our model to understand the themes and
              meaning of a song.
            </p>
            <p className="mb-1 ml-4 font-bold">3. The Multimodal AI Model</p>
            <p className="mb-2 ml-4">
              The core of our system is an AI model specifically trained to
              analyze multimodal data—a combination of a Mel-Spectrogram (image)
              and lyrics (text). By analyzing both features together, the model
              can make more accurate predictions about a song's age rating. This
              is a significant breakthrough because the model not only "hears"
              the music but also "understands" its message.
            </p>
          </div>
        </div>
      </div>
    </LayoutUser>
  );
}
