/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/loading";
import LayoutUser from "../../components/layout_user";
import type { userType } from "../../types/user";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import AXIOS_INSTANCE from "../../utils/axios_instance";
import Swal from "sweetalert2";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardAdminPage() {
  const authUser = useAuthUser() as { uuid: string } | null;
  const user_uuid = authUser ? authUser.uuid : null;
  const [isConfirmAuthenticated, setIsConfirmAuthenticated] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userData, setUserData] = useState<userType>();
  const [stats, setStats] = useState<{
    daily: any[];
    gender: any[];
    age_all: any[];
    age_male: any[];
    age_female: any[];
  }>({
    daily: [],
    gender: [],
    age_all: [],
    age_male: [],
    age_female: [],
  });
  const [selectedGender, setSelectedGender] = useState<
    "all" | "male" | "female"
  >("all");

  function generateFullMonthDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dates: string[] = [];
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d);
      const formatted = date.toISOString().split("T")[0];
      dates.push(formatted);
    }
    return dates;
  }

  useEffect(() => {
    if (!user_uuid) {
      setLoadingPage(false);
      return;
    }
    (async () => {
      try {
        if (!isConfirmAuthenticated) {
          const { data: resUser } = await AXIOS_INSTANCE.get(`/user/uuid`, {
            params: { uuid: user_uuid },
          });
          setUserData(resUser);
          setIsConfirmAuthenticated(true);
        }

        const { data: resDashboard } = await AXIOS_INSTANCE.get(
          `/user_activity`
        );
        setStats({
          daily: resDashboard.daily,
          gender: resDashboard.gender,
          age_all: resDashboard.age_all,
          age_male: resDashboard.age_male,
          age_female: resDashboard.age_female,
        });
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

  const normalizedDaily = useMemo(() => {
    const dates = generateFullMonthDates();
    return dates.map((date) => {
      const found = stats.daily.find((item) => item.date === date);
      return found ?? { date, total: 0 };
    });
  }, [stats.daily]);

  const normalizedGender = useMemo(() => {
    const dates = generateFullMonthDates();
    return dates.map((date) => {
      const male = stats.gender.find(
        (item) => item.date === date && item.gender === "male"
      );
      const female = stats.gender.find(
        (item) => item.date === date && item.gender === "female"
      );
      return {
        date,
        male: male ? male.total : 0,
        female: female ? female.total : 0,
      };
    });
  }, [stats.gender]);

  const filteredAge = useMemo(() => {
    if (selectedGender === "all") return stats.age_all;
    if (selectedGender === "male") return stats.age_male;
    return stats.age_female;
  }, [selectedGender, stats.age_all, stats.age_male, stats.age_female]);

  return loadingPage ? (
    <LoadingSpinner />
  ) : (
    <LayoutUser userData={userData!}>
      <h1 className="mb-4 text-2xl font-bold">📊 User Statistics Dashboard</h1>
      <div className="space-y-8">
        <div>
          <h2 className="mb-2 text-lg font-bold">
            📈 Number of Online Users per Day (1 Month)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={normalizedDaily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">🧍 Gender Based Activities</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={normalizedGender}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="male"
                stroke="#8884d8"
                name="Male"
              />
              <Line
                type="monotone"
                dataKey="female"
                stroke="#82ca9d"
                name="Female"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">🎂 Based on Age Group</h2>
            <select
              className="px-2 py-1 border rounded"
              value={selectedGender}
              onChange={(e) =>
                setSelectedGender(e.target.value as "all" | "male" | "female")
              }
            >
              <option value="all">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredAge}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age_group" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </LayoutUser>
  );
}
