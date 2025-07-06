import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Home from "./components/Home";
import About from "./components/About";

export default function App() {
  const user = useUser();
  console.log(user);

  return (
    // <header>
    //   <SignedOut>
    //     <SignInButton className="text-2xl border-[1px] px-2 p-5 py-1 cursor-pointer" />
    //   </SignedOut>
    //   <SignedIn>
    //     <UserButton />
    //   </SignedIn>
    // </header>
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </>
  );
}
