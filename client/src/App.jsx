import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import AdminDashboard from "./pages/AdminDashboard";
import CreateRequest from "./pages/CreateRequest";
import Login from "./pages/Login";
import RequestDetails from "./pages/RequestDetails";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import UserDashboard from "./pages/UserDashboard";

import {
  getStoredUser,
  isAuthenticated,
} from "./utils/auth";

function App() {
  const [authenticated, setAuthenticated] = useState(
    isAuthenticated()
  );

  const [user, setUser] = useState(
    getStoredUser()
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthenticated(isAuthenticated());
      setUser(getStoredUser());
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const currentPath = window.location.pathname;

  if (!authenticated) {
    return <Login />;
  }

  const renderPage = () => {
    if (currentPath === "/create-request") {
      if (user?.role !== "USER") {
        return (
          <DashboardByRole
            role={user?.role}
          />
        );
      }

      return <CreateRequest />;
    }

    if (currentPath.startsWith("/request/")) {
      return <RequestDetails />;
    }

    return (
      <DashboardByRole
        role={user?.role}
      />
    );
  };

  return (
    <>
      <Navbar />
      {renderPage()}
    </>
  );
}

function DashboardByRole({ role }) {
  if (role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (role === "REVIEWER") {
    return <ReviewerDashboard />;
  }

  return <UserDashboard />;
}

export default App;