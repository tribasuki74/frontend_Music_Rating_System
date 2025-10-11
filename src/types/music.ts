import type { userType } from "./user";

export type masterDataType = {
  uuid: string;
  title: string;
  duration: number;
  ai_rating_result: string;
  thumbnail_filename: string;
  music_filename: string;
  created_at: string;
  background_status: string;
  background_log: string;
  background_color: string;
  is_active: boolean;
  user_ratings: userRating[];
  user: userType;
};

type userRating = {
  rating: string;
};
