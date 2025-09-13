/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useRef, useState, useEffect } from "react";
import AXIOS_INSTANCE from "../utils/axios_instance";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { STORAGE_S3 } from "../utils/constant";

type TrackType = {
  uuid: string;
  title: string;
  url: string;
  ai_rating_result: string;
  thumbnail?: string;
  user_rating?: string;
  background_color: string;
};

type PlayerContextType = {
  currentTrack: TrackType | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  updateCurrentTrackRating: (newRating: string) => void;
  playTrack: (track: TrackType, autoplay?: boolean) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  playPrev: () => void;
  playNext: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [currentTrack, setCurrentTrack] = useState<TrackType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateCurrentTrackRating = (newRating: string) => {
    setCurrentTrack((prev) =>
      prev ? { ...prev, user_rating: newRating } : prev
    );
  };

  const playTrack = (track: TrackType, autoplay: boolean = true) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(autoplay);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const playPrev = () => seekTo(0);
  const playNext = () => {
    if (audioRef.current && duration > 0) {
      seekTo(duration - 0.1);
    }
  };

  useEffect(() => {
    const fetchLastHistory = async () => {
      if (!user_uuid) return;
      try {
        const res = await AXIOS_INSTANCE.get(`/user_history`, {
          params: {
            user_uuid: user_uuid,
          },
        });
        if (res.data && res.data.total_data > 0) {
          const last = res.data.data[0];
          const track = last.user_upload;
          setCurrentTrack({
            uuid: track.uuid,
            title: track.title,
            url: `${STORAGE_S3}/user_uploads/musics/${track.music_filename}`,
            thumbnail: track.thumbnail_filename,
            ai_rating_result: track.ai_rating_result,
            user_rating: last.user_rating,
            background_color: track.background_color,
          });
          setCurrentTime(last.last_duration);
          if (audioRef.current) {
            audioRef.current.currentTime = last.last_duration;
          }
        }
      } catch (error) {
        console.log("Gagal fetch last history:", error);
      }
    };
    fetchLastHistory();
  }, [user_uuid]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    audio.src = currentTrack.url;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      if (currentTrack && currentTime > 0) {
        audio.currentTime = currentTime;
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
    };
    if (isPlaying) {
      audio.play().catch(() => console.warn("Autoplay blocked by browser"));
    }
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio
        .play()
        .then(() => {
          audio.muted = false;
        })
        .catch(() => {
          console.warn("Autoplay blocked by browser");
        });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!currentTrack || !isPlaying || !user_uuid) return;
    const sendHistory = async () => {
      if (!audioRef.current) return;
      try {
        await AXIOS_INSTANCE.post("/user_history", {
          user_uuid: user_uuid,
          user_upload_uuid: currentTrack!.uuid,
          last_duration: audioRef.current.currentTime,
        });
      } catch (error) {
        console.log("Gagal mengirim user history:", error);
      }
    };
    const intervalId = setInterval(() => {
      if (audioRef.current) sendHistory();
    }, 15000);
    return () => clearInterval(intervalId);
  }, [currentTrack, isPlaying, user_uuid]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack || !user_uuid) return;
    const audio = audioRef.current;
    const sendFinalHistory = async () => {
      try {
        await AXIOS_INSTANCE.post("/user_history", {
          user_uuid,
          user_upload_uuid: currentTrack.uuid,
          last_duration: audio.currentTime,
        });
      } catch (error) {
        console.log("Gagal kirim final user history:", error);
      }
    };
    const handlePause = () => sendFinalHistory();
    const handleEnded = () => sendFinalHistory();
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, user_uuid]);

  useEffect(() => {
    return () => {
      if (!audioRef.current || !currentTrack || !user_uuid) return;
      AXIOS_INSTANCE.post("/user_history", {
        user_uuid,
        user_upload_uuid: currentTrack.uuid,
        last_duration: audioRef.current.currentTime,
      }).catch(console.log);
    };
  }, [currentTrack]);

  useEffect(() => {
    const handleUnload = () => {
      if (!audioRef.current || !currentTrack || !user_uuid) return;
      const data = JSON.stringify({
        user_uuid,
        user_upload_uuid: currentTrack.uuid,
        last_duration: audioRef.current.currentTime,
      });
      navigator.sendBeacon("/user_history", data);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [currentTrack, user_uuid]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playTrack,
        togglePlay,
        seekTo,
        playPrev,
        playNext,
        updateCurrentTrackRating,
      }}
    >
      {children}
      <audio ref={audioRef} muted />
    </PlayerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
};
