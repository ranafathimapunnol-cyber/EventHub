"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();

    if (!user) {
      // Not logged in → show landing page
      return;
    }

    // Logged in → don't stay on landing page
    if (user.role === "organizer") {
      router.replace("/organizer");
    } else {
      router.replace("/events");
    }
  }, [router]);

  const user = getUser();

  // If logged in, show a tiny loading state while redirecting
  if (user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5f0e9",
          color: "#3b342d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 34,
              height: 34,
              margin: "0 auto 14px",
              border: "3px solid #ddd2c5",
              borderTopColor: "#3b342d",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
            }}
          />

          <p style={{ margin: 0, fontSize: 13 }}>
            Taking you to your dashboard...
          </p>
        </div>

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  // ============================================================
  // YOUR EXISTING LANDING PAGE GOES HERE
  // ============================================================

  return (
    <main className="landing">
      <section className="hero">
        <div>
          <span className="eyebrow">EVENTS • EXPERIENCES • MEMORIES</span>

          <h1>
            Moments worth
            <br />
            <em>remembering.</em>
          </h1>

          <p>
            Discover unique events, connect with people, and create
            experiences you'll remember.
          </p>

          <div className="actions">
            <button onClick={() => router.push("/events")}>
              Discover events →
            </button>

            <button
              className="secondary"
              onClick={() => router.push("/register")}
            >
              Get started
            </button>
          </div>
        </div>

        <div className="visual">
          <span>✦</span>
          <span>◈</span>
          <span>✧</span>
        </div>
      </section>

      <style jsx>{`
        .landing {
          min-height: calc(100vh - 76px);
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(185, 145, 104, 0.16),
              transparent 30%
            ),
            #f5f0e9;
          color: #3b342d;
        }

        .hero {
          width: min(1180px, calc(100% - 48px));
          min-height: calc(100vh - 76px);
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 70px;
        }

        .eyebrow {
          color: #997653;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        h1 {
          margin: 20px 0;
          font-size: clamp(52px, 7vw, 88px);
          line-height: 0.95;
          letter-spacing: -5px;
        }

        h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
          color: #997653;
        }

        p {
          max-width: 520px;
          color: #81766c;
          line-height: 1.8;
          font-size: 15px;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        button {
          border: 0;
          border-radius: 12px;
          padding: 13px 19px;
          background: #3b342d;
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        button:hover {
          background: #51473e;
        }

        button.secondary {
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid #d8cec3;
          color: #4d4339;
        }

        .visual {
          width: 330px;
          height: 330px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transform: rotate(-10deg);
          background:
            radial-gradient(
              circle,
              rgba(153, 118, 83, 0.18),
              transparent 68%
            );
          color: rgba(153, 118, 83, 0.35);
          font-size: 55px;
        }

        .visual span:nth-child(2) {
          font-size: 90px;
        }

        @media (max-width: 750px) {
          .hero {
            padding: 60px 0;
          }

          .visual {
            display: none;
          }

          h1 {
            letter-spacing: -3px;
          }

          .actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}