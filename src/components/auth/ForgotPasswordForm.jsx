import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error(error.message || "Unable to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Reset your password</h2>
      <p style={styles.subtitle}>
        Enter your email and we will send you a reset link.
      </p>

      <label style={styles.label} htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        style={styles.input}
      />

      <button type="submit" disabled={isSubmitting} style={styles.button}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>

      <p style={styles.helperText}>
        <Link to="/login" style={styles.link}>
          Back to sign in
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

export default ForgotPasswordForm;
