import RegisterForm from "../../components/auth/RegisterForm";

function Register() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <RegisterForm />
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
    maxWidth: "32rem",
  },
};

export default Register;
