"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/register/", {
        name,
        email,
        password,
      });

      setSuccess("Account created successfully.");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Unable to create your account."
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
            <span className="auth-brand-icon">E</span>

            <span className="auth-brand-name">
              Event<span>Hub</span>
            </span>
          </Link>

          <div className="auth-visual-content">

            <div className="auth-eyebrow">
              Discover · Connect · Experience
            </div>

            <h1>
              Your next
              <br />
              story starts here.
            </h1>

            <p className="auth-visual-description">
              Join EventHub and discover events, experiences,
              communities and moments worth remembering.
            </p>

          </div>

          <div className="auth-quote">
            <span />
            Make today an experience.
          </div>

        </section>

        {/* FORM */}

        <section className="auth-form-area">

          <div className="auth-form">

            <Link href="/" className="auth-brand auth-mobile-brand">
              <span className="auth-brand-icon">E</span>

              <span className="auth-brand-name">
                Event<span>Hub</span>
              </span>
            </Link>

            <div className="auth-heading">

              <div className="auth-heading-label">
                GET STARTED
              </div>

              <h2>
                Create your
                <br />
                account.
              </h2>

              <p>
                Create your EventHub account and start
                discovering experiences around you.
              </p>

            </div>

            {error && (
              <div className="auth-message auth-error">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-message auth-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="auth-field">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  className="auth-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rana Fathima"
                  autoComplete="name"
                  required
                />

              </div>

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
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="auth-show"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>

                </div>

              </div>

              <label className="auth-check">
                <input type="checkbox" required />
                <span>
                  I agree to EventHub's terms and privacy policy.
                </span>
              </label>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create account →"}
              </button>

            </form>

            <div className="auth-divider">
              <span>ALREADY A MEMBER?</span>
            </div>

            <Link
              href="/login"
              className="auth-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Sign in to your account
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
