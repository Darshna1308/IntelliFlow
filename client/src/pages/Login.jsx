import {
  useState,
} from "react";

import { api } from "../api";

import LoadingCard from "../components/LoadingCard";
import MessageCard from "../components/MessageCard";


function Login() {

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setMessage("");


      if (
        !formData.email ||
        !formData.password
      ) {

        setMessage(
          "Please enter your email and password."
        );

        return;
      }


      try {

        setLoading(true);


        const data =
          await api.login(
            formData
          );


        localStorage.setItem(
          "intelliflow_token",
          data.token
        );


        localStorage.setItem(
          "intelliflow_user",
          JSON.stringify(
            data.user
          )
        );


        window.location.href =
          "/";

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };


  if (loading) {

    return (
      <LoadingCard
        message="Signing you in..."
      />
    );
  }


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-brand">

          <div className="auth-logo">
            IF
          </div>

          <div>

            <h1>
              IntelliFlow
            </h1>

            <p>
              Intelligent Workflow
              Management
            </p>

          </div>

        </div>


        <div className="auth-header">

          <p className="page-eyebrow">
            SECURE ACCESS
          </p>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to continue to
            your workflow workspace.
          </p>

        </div>


        <MessageCard
          message={message}
        />


        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

          </div>


          <button
            type="submit"
            disabled={loading}
          >
            Sign In
          </button>

        </form>


        <div className="auth-footer">

          <p>
            IntelliFlow provides
            role-based workflow
            management for users,
            reviewers, and admins.
          </p>

        </div>

      </div>

    </div>
  );
}


export default Login;