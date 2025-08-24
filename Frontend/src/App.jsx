import React, { useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth
} from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from './components/auth/RequireAuth';
import Home from "./components/Home";
import AllStudentsPage from './components/students/AllStudentsPage';
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
import PaymentSuccess from "./pages/PaymentSuccess";
import ManagePurchasedPlan from './components/plans/ManagePurchasedPlan';
import StudentsPage from './components/students/StudentsPage';
import InstitutionWizard from './components/siteBuilder/InstitutionWizard';
import PublicSite from './components/siteBuilder/PublicSite';
const isSubdomain = typeof window !== 'undefined' && (() => {
  try {
    const root = import.meta.env.VITE_ROOT_DOMAIN || 'abhimanyu.tech';
    const h = window.location.host;
    if (/localhost|127\.0\.0\.1/.test(h)) return false;
    const parts = h.toLowerCase().split('.');
    const rootParts = root.toLowerCase().split('.');
    if (parts.length <= rootParts.length) return false;
    return h.toLowerCase().endsWith(root.toLowerCase()) && parts[0] !== 'www';
  } catch { return false; }
})();
import StudentLoginPage from './pages/StudentLoginPage.jsx';
import StudentDashboardPage from './pages/StudentDashboardPage.jsx';
import { SignIn, SignUp } from '@clerk/clerk-react';


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
      const base = import.meta.env.VITE_SERVER_URL || window.__API_BASE__ || '';
      const data = await fetchWithAuth(`${base}/admin`);
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
        {/* Public site routing: clean URLs on subdomains */}
        {isSubdomain ? (
          <>
            <Route path="/" element={<PublicSite />} />
            <Route path="/student-login" element={<PublicSite />} />
            <Route path="/student-dashboard" element={<PublicSite />} />
          </>
        ) : (
          <Route path="/" element={<Home />} />
        )}
        <Route path="/about" element={<About />} />
  {/* Auth pages (Clerk) */}
  <Route path="/sign-in" element={<div className="min-h-[70vh] grid place-items-center p-6"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" /></div>} />
  <Route path="/sign-up" element={<div className="min-h-[70vh] grid place-items-center p-6"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" /></div>} />
        <Route element={<RequireAuth />}>
          <Route path="/super" element={<SuperAdmin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreatePlanForm />} />
          <Route path="/my-plan/:planId" element={<ManagePurchasedPlan />} />
          <Route path="/my-plan/:planId/students" element={<StudentsPage />} />
          <Route path="/my-plan/:planId/allstudents" element={<AllStudentsPage />} />
          <Route path="/my-plan/:planId/build-website" element={<Navigate to="./update-website" replace />} />
          <Route path="/my-plan/:planId/update-website" element={<InstitutionWizard mode="update" />} />
          <Route path="/dashboard/website-builder/basic" element={<InstitutionWizard />} />
        </Route>
        <Route path="/plans" element={<PlansExplorer />} />
        <Route path="/create-plan" element={<CreateOrderComponent />} />
        <Route path="/plan/:id" element={<ViewPlanByID />} />
        <Route path="/payment-success" element={<PaymentSuccess/>}/>
  {/* Legacy path-based public site for /site/:inst rewrites */}
  <Route path="/public-site" element={<PublicSite />}>
          <Route path="student-login" element={<StudentLoginPage />} />
          <Route path="student-dashboard" element={<StudentDashboardPage />} />
        </Route>
  {/* Legacy direct routes (optional): keep or remove */}
      </Routes>
    </>
  );
}

