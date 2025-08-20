import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Outlet, useLocation } from 'react-router-dom';

export default function RequireAuth() {
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={returnTo} signInUrl="/sign-in" />
      </SignedOut>
    </>
  );
}
