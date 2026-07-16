import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Unable to create your account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Create account</h2>
      <p style={styles.subtitle}>Start organizing your tasks in minutes.</p>

      <label style={styles.label} htmlFor="name">
        Full name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        style={styles.input}
      />

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

      <label style={styles.label} htmlFor="confirmPassword">
        Confirm password
      </label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        style={styles.input}
      />

      <button type="submit" disabled={isSubmitting} style={styles.button}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p style={styles.helperText}>
        Already have an account?{" "}
        <Link to="/login" style={styles.link}>
          Sign in
        </Link>
      </p>
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
  helperText: {
    margin: 0,
    color: "#475569",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default RegisterForm;
