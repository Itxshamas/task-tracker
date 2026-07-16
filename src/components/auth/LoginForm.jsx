import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Unable to sign in right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Welcome back</h2>
      <p style={styles.subtitle}>Sign in to continue to your tasks.</p>

      <label style={styles.label} htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        style={styles.input}
      />

      <label style={styles.label} htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        style={styles.input}
      />

      <button type="submit" disabled={isSubmitting} style={styles.button}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div style={styles.links}>
        <Link to="/forgot-password" style={styles.link}>
          Forgot password?
        </Link>
        <Link to="/register" style={styles.link}>
          Create an account
        </Link>
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "2rem",
    borderRadius: "0.75rem",
    backgroundColor: "#fff",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    color: "#475569",
  },
  label: {
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    padding: "0.75rem 0.9rem",
    border: "1px solid #cbd5e1",
    borderRadius: "0.5rem",
    fontSize: "1rem",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.8rem 1rem",
    border: "none",
    borderRadius: "0.5rem",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
  },
  links: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0.25rem",
    fontSize: "0.95rem",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default LoginForm;
