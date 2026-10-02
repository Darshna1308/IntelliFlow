import {
  useState,
} from "react";

import api from "../services/api";

import {
  getStoredUser,
} from "../utils/auth";

import LoadingCard from "../components/LoadingCard";
import MessageCard from "../components/MessageCard";


function Login() {

  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    if (
      !email.trim() ||
      !password
    ) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await api.login({
          email: email.trim(),
          password,
        });


      const token =
        response?.token ||
        response?.data?.token;


      const user =
        response?.user ||
        response?.data?.user ||
        getStoredUser();


      if (!token || !user) {

        throw new Error(
          "Login response was incomplete."
        );
      }


      localStorage.setItem(
        "intelliflow_token",
        token
      );


      localStorage.setItem(
        "intelliflow_user",
        JSON.stringify(user)
      );


      window.location.href = "/";

    } catch (loginError) {

      console.error(
        "Login error:",
        loginError
      );


      setError(
        loginError?.message ||
        "Unable to sign in. Please check your credentials and try again."
      );

    } finally {

      setLoading(false);

    }
  };


  if (loading) {

    return (
      <main className="auth-page">

        <div className="auth-shell">

          <div className="auth-brand">

            <span className="auth-brand-mark">
              IF
            </span>

            <span>
              IntelliFlow
            </span>

          </div>

          <LoadingCard />

        </div>

      </main>
    );
  }


  return (
    <main className="auth-page">

      <div className="auth-shell">

        <section className="auth-intro">

          <div className="auth-brand">

            <span className="auth-brand-mark">
              IF
            </span>

            <span>
              IntelliFlow
            </span>

          </div>


          <div className="auth-intro-content">

            <span className="auth-eyebrow">
              Intelligent Workflow Platform
            </span>

            <h1>
              Move every request
              <br />
              <span>forward with clarity.</span>
            </h1>

            <p>
              Manage requests, approvals,
              reviews, documents, and workflow
              intelligence from one place.
            </p>

          </div>


          <div className="auth-feature-list">

            <div className="auth-feature">

              <span className="auth-feature-dot" />

              <div>
                <strong>
                  Structured workflows
                </strong>

                <p>
                  Keep every request moving
                  through a clear approval path.
                </p>
              </div>

            </div>


            <div className="auth-feature">

              <span className="auth-feature-dot" />

              <div>
                <strong>
                  Intelligent prioritization
                </strong>

                <p>
                  Surface deadline and workflow
                  risks before they become blockers.
                </p>
              </div>

            </div>


            <div className="auth-feature">

              <span className="auth-feature-dot" />

              <div>
                <strong>
                  Complete visibility
                </strong>

                <p>
                  Track decisions, comments,
                  documents, and audit activity.
                </p>
              </div>

            </div>

          </div>

        </section>


        <section className="auth-panel">

          <div className="auth-form-header">

            <span className="auth-eyebrow">
              Secure workspace
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to your
              IntelliFlow workspace.
            </p>

          </div>


          {error && (
            <div className="auth-message">

              <MessageCard
                type="error"
                message={error}
              />

            </div>
          )}


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                autoComplete="email"
              />

            </div>


            <div className="form-group">

              <div className="auth-password-label">

                <label htmlFor="password">
                  Password
                </label>

              </div>


              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />

            </div>


            <button
              type="submit"
              className="primary-button auth-submit-button"
              disabled={loading}
            >
              Sign in
            </button>

          </form>


          <div className="auth-footer">

            <span>
              IntelliFlow
            </span>

            <span>
              Intelligent workflow management
            </span>

          </div>

        </section>

      </div>

    </main>
  );
}


export default Login;