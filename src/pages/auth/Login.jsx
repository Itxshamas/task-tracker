import LoginForm from "../../components/auth/LoginForm";

function Login() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <LoginForm />
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

export default Login;
