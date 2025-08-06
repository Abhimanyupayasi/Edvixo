import React, { useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth
} from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Home from "./components/Home";
import About from "./components/About";
import isProtected from "./clerk/ClerkRole";
import useUserInfo from "./clerk/ClerkRole";
import SuperAdmin from "./layouts/SuperAdmin";
import Dashboard from "./components/Dashboard";
import CreatePlanForm from "./super-admin/CreatePlan";
import ViewPlanByID from "./components/pricing/ViewPlanByID";
import PlanFeatures from "./components/plans/PlanFeatures";
import PlansExplorer from "./components/plans/PlansExplorer";
import CreateOrderComponent from "./components/orders/CreateOrder";


export default function App() {
  const { isLoaded, userId, getToken } = useAuth();
  
  // Enhanced fetch function with token handling
  const fetchWithAuth = async (url, options = {}) => {
    try {
      const token = await getToken();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        try {
          const data = await fetchWithAuth('http://localhost:8000/admin');
          console.log("API data:", data);
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      };
      
      loadData();
    }
  }, [userId]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/super" element={<SuperAdmin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreatePlanForm />} />
        <Route path="/plans" element={<PlansExplorer />} />
        <Route path="/create-plan" element={<CreateOrderComponent />} />
        <Route path="/plan/:id" element={<ViewPlanByID />} />
      </Routes>
    </>
  );
}

