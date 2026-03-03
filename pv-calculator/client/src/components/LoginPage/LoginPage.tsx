import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../services/api";
import "./LoginPage.css";

interface LoginPageProps {
  onAuthenticated: (token: string) => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password.trim() || loading) return;

      setError(null);
      setLoading(true);

      try {
        const { data } = await api.post("/auth/login", { password });
        localStorage.setItem("pv_auth_token", data.token);
        onAuthenticated(data.token);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Verbindung fehlgeschlagen";
        setError(msg);
        setPassword("");
        inputRef.current?.focus();
      } finally {
        setLoading(false);
      }
    },
    [password, loading, onAuthenticated]
  );

  return (
    <div className="login-page">
      <div className="login-page__bg" />
      <div className="login-page__overlay" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-card__header">
          <h1 className="login-card__title">PV Potential</h1>
          <p className="login-card__subtitle">Zugang anfordern</p>
        </div>

        <div className="login-card__field">
          <input
            ref={inputRef}
            type="password"
            className={`login-card__input ${error ? "login-card__input--error" : ""}`}
            placeholder="Zugangs-Code"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            autoComplete="current-password"
          />
          {error && <p className="login-card__error">{error}</p>}
        </div>

        <button
          type="submit"
          className="login-card__cta"
          disabled={!password.trim() || loading}
        >
          {loading ? "Prüfe..." : "Zugang"}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4 9h10M10 5l4 4-4 4"
              stroke="var(--color-yellow)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
