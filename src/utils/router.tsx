import { createBrowserRouter } from "react-router-dom";
import {
  TO_ABOUT,
  TO_ACCOUNT,
  TO_DASHBOARD_GUEST,
  TO_DASHBOARD_MAIN,
  TO_EXPLORE_SEARCH,
  TO_LOGIN,
  TO_MUSIC_REPORT,
  TO_MY_MUSIC,
  TO_MY_PLAYLIST,
  TO_MY_PLAYLIST_DETAIL,
  TO_MY_PLAYLIST_FORM,
  TO_OTP,
  TO_PLAY_MUSIC,
  TO_PROFILE_FORM,
  TO_PUBLIC_PLAYLIST,
  TO_PUBLIC_PLAYLIST_DETAIL,
  TO_RATING,
  TO_RATING_DETAIL,
  TO_REGISTER,
  TO_TRENDING,
  TO_TRENDING_MORE,
  TO_UPLOAD,
  TO_UPLOAD_DETAIL,
  TO_USER_MANAGEMENT,
  TO_USER_PROFILE,
} from "./paths";
import DashboardMainPage from "../pages/dashboard_main";
import RegisterPage from "../pages/register";
import LoginPage from "../pages/login";
import OtpPage from "../pages/otp";
import ProfileFormPage from "../pages/profile_form";
import DashboardGuestPage from "../pages/dashboard_guest";
import ExploreSearchPage from "../pages/explore_search";
import TrendingPage from "../pages/trending";
import RatingPage from "../pages/rating";
import UploadPage from "../pages/upload";
import AccountPage from "../pages/account";
import UploadDetailPage from "../pages/upload_detail";
import PlayMusicPage from "../pages/play_music";
import TrendingMorePage from "../pages/trending_more";
import AboutEducationPage from "../pages/about";
import RatingDetailPage from "../pages/rating_detail";
import MyMusicPage from "../pages/my_music";
import MyPlaylistPage from "../pages/my_playlist";
import MyPlaylistDetailPage from "../pages/my_playlist_detail";
import MyPlaylistFormPage from "../pages/my_playlist_form";
import PublicPlaylistPage from "../pages/public_playlist";
import PublicPlaylistDetailPage from "../pages/public_playlist_detail";
import UserProfilePage from "../pages/user_profile";
import UserManagementPage from "../pages/user_management";
import MusicReportPage from "../pages/music_report";

export const ROUTER = createBrowserRouter([
  {
    path: TO_DASHBOARD_MAIN,
    element: <DashboardMainPage />,
  },
  {
    path: TO_DASHBOARD_GUEST,
    element: <DashboardGuestPage />,
  },
  {
    path: TO_REGISTER,
    element: <RegisterPage />,
  },
  {
    path: `${TO_PROFILE_FORM}/:email/:terms/:type`,
    element: <ProfileFormPage />,
  },
  {
    path: TO_LOGIN,
    element: <LoginPage />,
  },
  {
    path: `${TO_OTP}/:email`,
    element: <OtpPage />,
  },
  {
    path: TO_EXPLORE_SEARCH,
    element: <ExploreSearchPage />,
  },
  {
    path: TO_TRENDING,
    element: <TrendingPage />,
  },
  {
    path: `${TO_TRENDING_MORE}/:view`,
    element: <TrendingMorePage />,
  },
  {
    path: TO_RATING,
    element: <RatingPage />,
  },
  {
    path: `${TO_RATING_DETAIL}/:uuid`,
    element: <RatingDetailPage />,
  },
  {
    path: TO_UPLOAD,
    element: <UploadPage />,
  },
  {
    path: `${TO_UPLOAD_DETAIL}/:uuid`,
    element: <UploadDetailPage />,
  },
  {
    path: TO_ACCOUNT,
    element: <AccountPage />,
  },
  {
    path: `${TO_USER_PROFILE}/:user_uuid`,
    element: <UserProfilePage />,
  },
  {
    path: TO_ABOUT,
    element: <AboutEducationPage />,
  },
  {
    path: TO_MY_MUSIC,
    element: <MyMusicPage />,
  },
  {
    path: TO_USER_MANAGEMENT,
    element: <UserManagementPage />,
  },
  {
    path: TO_MUSIC_REPORT,
    element: <MusicReportPage />,
  },
  {
    path: TO_PUBLIC_PLAYLIST,
    element: <PublicPlaylistPage />,
  },
  {
    path: `${TO_MY_PLAYLIST}/:user_upload_uuid?`,
    element: <MyPlaylistPage />,
  },
  {
    path: `${TO_MY_PLAYLIST_DETAIL}/:user_playlist_uuid`,
    element: <MyPlaylistDetailPage />,
  },
  {
    path: `${TO_PUBLIC_PLAYLIST_DETAIL}/:user_playlist_uuid`,
    element: <PublicPlaylistDetailPage />,
  },
  {
    path: `${TO_MY_PLAYLIST_FORM}/:uuid?`,
    element: <MyPlaylistFormPage />,
  },
  {
    path: `${TO_PLAY_MUSIC}/:uuid`,
    element: <PlayMusicPage />,
  },
]);
