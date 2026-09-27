import {
  useState,
} from "react";

import {
  getStoredUser,
  logout,
} from "../utils/auth";


function Navbar() {

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  const user =
    getStoredUser();


  const navigate = (
    path
  ) => {

    setMenuOpen(false);

    window.location.href =
      path;
  };


  const handleLogout = () => {

    setMenuOpen(false);

    logout();
  };


  const isUser =
    user?.role ===
    "USER";


  const isReviewer =
    user?.role ===
    "REVIEWER";


  const isAdmin =
    user?.role ===
    "ADMIN";


  return (
    <nav className="navbar">

      <div className="navbar-inner">

        <button
          type="button"
          className="navbar-brand"
          onClick={() =>
            navigate("/")
          }
        >

          <span className="navbar-logo">
            IF
          </span>

          <span className="navbar-brand-text">

            <strong>
              IntelliFlow
            </strong>

            <small>
              Workflow Management
            </small>

          </span>

        </button>


        <button
          type="button"
          className="navbar-menu-button"
          onClick={() =>
            setMenuOpen(
              (previous) =>
                !previous
            )
          }
          aria-label="Toggle navigation"
        >
          ☰
        </button>


        <div
          className={
            `navbar-content ${
              menuOpen
                ? "navbar-content-open"
                : ""
            }`
          }
        >

          <div className="navbar-links">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
            >
              Dashboard
            </button>


            {isUser && (

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/create-request"
                  )
                }
              >
                New Request
              </button>

            )}


            {isReviewer && (

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
              >
                Review Queue
              </button>

            )}


            {isAdmin && (

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
              >
                Control Center
              </button>

            )}

          </div>


          <div className="navbar-user">

            <div className="navbar-user-info">

              <strong>
                {
                  user?.name ||
                  "User"
                }
              </strong>

              <span>
                {
                  user?.role ||
                  "USER"
                }
              </span>

            </div>


            <button
              type="button"
              className="navbar-logout"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </nav>
  );
}


export default Navbar;