import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await updatePassword(password);
      toast.success("Password updated successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Unable to update your password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Set a new password</h2>
          <p style={styles.subtitle}>Choose a new password for your account.</p>

          <label style={styles.label} htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "#f8fafc",
  },
  card: {
    width: "100%",
    maxWidth: "28rem",
  },
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
};

export default ResetPassword;
