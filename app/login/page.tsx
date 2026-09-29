"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import api from "../../lib/api";
import { saveAuth } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login/", {
        email,
        password,
      });

      saveAuth(response.data);

      router.push("/events");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">

      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-shell">

        {/* LEFT */}

        <section className="auth-visual">

          <Link href="/" className="auth-brand">

            <span className="auth-brand-icon">
              E
            </span>

            <span className="auth-brand-name">
              Event<span>Hub</span>
            </span>

          </Link>

          <div className="auth-visual-content">

            <div className="auth-eyebrow">
              WELCOME BACK
            </div>

            <h1>
              Come back
              <br />
              to your world.
            </h1>

            <p className="auth-visual-description">
              Your next event, new connection, or unforgettable
              experience could be one click away.
            </p>

          </div>

          <div className="auth-quote">
            <span />
            There is always something happening.
          </div>

        </section>

        {/* FORM */}

        <section className="auth-form-area">

          <div className="auth-form">

            <Link href="/" className="auth-brand auth-mobile-brand">

              <span className="auth-brand-icon">
                E
              </span>

              <span className="auth-brand-name">
                Event<span>Hub</span>
              </span>

            </Link>

            <div className="auth-heading">

              <div className="auth-heading-label">
                WELCOME BACK
              </div>

              <h2>
                Sign in to
                <br />
                EventHub.
              </h2>

              <p>
                Continue discovering events and experiences
                made for you.
              </p>

            </div>

            {error && (
              <div className="auth-message auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="auth-field">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

              </div>

              <div className="auth-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="auth-input-wrap">

                  <input
                    id="password"
                    className="auth-input auth-password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-show"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>

                </div>

              </div>

              <div className="auth-check">

                <input
                  id="remember"
                  type="checkbox"
                />

                <label htmlFor="remember">
                  Remember me
                </label>

              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in →"}
              </button>

            </form>

            <div className="auth-divider">
              <span>NEW TO EVENTHUB?</span>
            </div>

            <Link
              href="/register"
              className="auth-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Create an account
            </Link>

            <p className="auth-footer">
              Secure authentication · Your data stays private.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}
