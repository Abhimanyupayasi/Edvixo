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
import PlansExplorer from "./components/pricing/ViewPricing";
import ViewPlanByID from "./components/pricing/ViewPlanByID";


export default function App() {
    const { isLoaded, userId } = useAuth();

  const fetchData = async () => {
    const response = await fetch('http://localhost:8000/admin', {
      credentials: 'include' // Required for cookies
    });
    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const user = useUser();
  console.log(user);

  
  
  return (
    
    <>
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/super" element={<SuperAdmin/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/create" element={<CreatePlanForm/>}/>
          <Route path='/plans' element={<PlansExplorer/>}/>
          <Route path="/plan/:id" element={<ViewPlanByID/>}/>
        </Routes>
      
    </>
  );
}

