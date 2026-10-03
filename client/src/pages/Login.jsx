import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import api from "../services/api";
import LibraryEntrance from "../components/library/LibraryEntrance";

export default function Login() {
  const reduced = useReducedMotion();
  const roleRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const signal = useCallback((type, role) => {
    if (role !== undefined) roleRef.current = role;
    window.dispatchEvent(
      new CustomEvent("intelliflow-mission-signal", {
        detail: { type, role: roleRef.current },
      })
    );
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    setError("");
    setStatus("loading");
    signal("login-start");

    try {
      const res = await api.login({ email: email.trim(), password });
      const data = res && res.data ? res.data : res;
      const token = data && (data.token || data.accessToken || data.access_token);
      const user = data && data.user ? data.user : data;

      if (!token) {
        throw new Error("The server did not return a session token.");
      }

      localStorage.setItem("intelliflow_token", token);
      localStorage.setItem("intelliflow_user", JSON.stringify(user));

      setStatus("success");
      signal("login-success");

      await new Promise((resolve) => setTimeout(resolve, reduced ? 250 : 1300));
      window.location.href = "/";
    } catch (err) {
      const message =
        (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) ||
        (err && err.message) ||
        "Login failed. Check your email and password, then try again.";
      setStatus("idle");
      setError(message);
      signal("login-error");
    }
  };

  return (
    <LibraryEntrance
      onSignal={signal}
      form={{ email, password, setEmail, setPassword, onSubmit, status, error }}
    />
  );
}
