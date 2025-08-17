import React from "react";
import { Outlet } from "react-router-dom";

function NoAuthLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default NoAuthLayout;
