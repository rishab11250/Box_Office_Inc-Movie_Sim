import { useEffect } from "react";

import api from "../../api/axios";

import { useDispatch } from "react-redux";

import { setUser } from "../../features/auth/authSlice";

import { useSelector } from "react-redux";

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");

        dispatch(setUser(res.data.user));
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <div className="p-10">
      <h1>{user?.studio?.name}</h1>

      <h2>Money: ₹{user?.studio?.money}</h2>

      <h2>
        Prestige:
        {user?.studio?.prestige}
      </h2>

      <h2>
        Fans:
        {user?.studio?.fans}
      </h2>

      <h2>
        Level:
        {user?.studio?.studioLevel}
      </h2>
    </div>
  );
};

export default Dashboard;
