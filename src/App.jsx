import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Connection Failed:", error.message);
          return;
        }

        console.log("✅ Supabase Connected Successfully");
        console.log("Session:", data.session);
      } catch (err) {
        console.error("Unexpected Error:", err);
      }
    };

    testConnection();
  }, []);

  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <div>
        <h1>🚀 Task Tracker</h1>
        <p>Milestone 1.2 - Supabase Connected</p>
      </div>
    </main>
  );
}

export default App;
