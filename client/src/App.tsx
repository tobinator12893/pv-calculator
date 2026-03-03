import { useState, useCallback, useEffect } from "react";
import { LoginPage } from "./components/LoginPage/LoginPage";
import { MainApp } from "./components/MainApp";
import api from "./services/api";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("pv_auth_token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    api.post("/auth/verify", { token })
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("pv_auth_token");
        setIsAuthenticated(false);
      });
  }, []);

  const handleAuthenticated = useCallback((_token: string) => {
    setIsAuthenticated(true);
  }, []);

  // Show nothing while checking token
  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
  }

  return <MainApp />;
}

export default App;
