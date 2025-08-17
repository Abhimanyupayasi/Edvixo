// src/utils/Helper.js
import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";


const useHelper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();

  return {
    navigate,
    location,
    getToken,
  };
};

export default useHelper;
