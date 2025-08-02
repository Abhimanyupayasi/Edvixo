import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const serverURL = import.meta.env.VITE_SERVER_URL;

const useUserInfo = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    role: null,
    name: null,
    email: null,
    userId: null,
    isLoaded: false,
    isAuthenticated: false,
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Token not available");

        const response = await fetch(`${serverURL}/protected`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        const user = data.user;

        setUserInfo({
          role: user?.privateMetadata?.role || "user",
          name: user?.firstName || "No Name",
          email: user?.emailAddresses?.[0]?.emailAddress || "No Email",
          userId: user?.id || "No ID",
          isLoaded: true,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Error fetching user info:", error.message);

        // ✅ Set loading complete even on error
        setUserInfo({
          role: null,
          name: null,
          email: null,
          userId: null,
          isLoaded: true,
          isAuthenticated: false,
        });

        // ✅ Redirect unauthenticated user
        navigate("/"); // or wherever you want
      }
    };

    fetchUserDetails();
  }, [getToken, navigate]);

  return userInfo;
};

export default useUserInfo;
