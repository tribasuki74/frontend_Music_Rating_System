import type { userType } from "./user";

export type myPlaylistType = {
  uuid: string;
  playlist_name: string;
  visibility: string;
  background_color: string;
  created_at: string;
  music_count: number;
  user: userType;
};
