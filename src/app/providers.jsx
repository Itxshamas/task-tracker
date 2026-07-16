import { Toaster } from "react-hot-toast";

import { AuthProvider } from "../context/AuthContext";

function Providers({ children }) {
  return (
    <AuthProvider>
      {children}

      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}

export default Providers;
