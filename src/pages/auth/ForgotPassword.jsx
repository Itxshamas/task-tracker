import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

function ForgotPassword() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ForgotPasswordForm />
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
};

export default ForgotPassword;
