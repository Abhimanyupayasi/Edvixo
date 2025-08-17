import React, { useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";

import Header from "./header/Header";
import HomePage from "../pages/HomePage";
import Footer from "./footer/Footer";

function Home() {
  const dispatch = useDispatch();
  const { user, isLoaded } = useUser();

  const userFromRedux = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (isLoaded && user) {
      const cleanedUser = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl,
      };
      dispatch(login({ userData: cleanedUser }));
    }
  }, [isLoaded, user, dispatch]);

  console.log("Redux User: ", userFromRedux);
  console.log("Clerk User: ", user);

  return (
    <div>
      <header>
        <Header />
        <HomePage />
        <Footer />
      </header>
    </div>
  );
}

export default Home;
