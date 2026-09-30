"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isLoggedIn } from "../lib/auth";

export default function HomePage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Authentication is checked ONLY after hydration.
    // This keeps server HTML and initial client HTML identical.
    const loggedIn = isLoggedIn();
    const user = getUser();

    if (loggedIn) {
      if (user?.role === "organizer") {
        router.replace("/organizer");
      } else {
        router.replace("/events");
      }

      return;
    }

    setCheckingAuth(false);
  }, [router]);

  /*
   * IMPORTANT:
   *
   * Do not check localStorage during the initial render.
   * The server cannot access localStorage.
   *
   * Therefore both server and client initially render
   * this exact loading screen.
   */
  if (checkingAuth) {
    return (
      <main className="loadingPage">
        <div className="loaderWrapper">
          <div className="loader" />
          <p>Loading EventHub...</p>
        </div>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f5f0e9;
            color: #3b342d;
          }

          .loaderWrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .loader {
            width: 32px;
            height: 32px;
            border: 3px solid #ded4ca;
            border-top-color: #80664b;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }

          p {
            margin: 0;
            color: #8a7d70;
            font-size: 13px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  /*
   * User is NOT logged in.
   * Show landing page.
   *
   * Notice:
   * We do NOT render another Navbar here.
   * Navbar should come from app/layout.tsx.
   */
  return (
    <main className="landing">
      <div className="background backgroundOne" />
      <div className="background backgroundTwo" />

      <section className="hero">
        <div className="heroContent">
          <span className="eyebrow">
            EVENTS • EXPERIENCES • MEMORIES
          </span>

          <h1>
            Find your next
            <br />
            <em>great moment.</em>
          </h1>

          <p>
            Discover events happening around you.
            From intimate gatherings to unforgettable
            experiences, find something worth remembering.
          </p>

          <div className="actions">
            <button
              className="primaryButton"
              onClick={() => router.push("/events")}
            >
              Explore events →
            </button>

            <button
              className="secondaryButton"
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="heroVisual">
          <div className="circle circleOne">
            <span>✦</span>
          </div>

          <div className="circle circleTwo">
            <span>◈</span>
          </div>

          <div className="circle circleThree">
            <span>✧</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <span className="featureIcon">◈</span>

          <div>
            <strong>Discover</strong>

            <p>
              Explore events, workshops, festivals,
              conferences and more.
            </p>
          </div>
        </div>

        <div className="feature">
          <span className="featureIcon">✦</span>

          <div>
            <strong>Book</strong>

            <p>
              Choose your tickets and secure your
              place in seconds.
            </p>
          </div>
        </div>

        <div className="feature">
          <span className="featureIcon">✧</span>

          <div>
            <strong>Experience</strong>

            <p>
              Turn ordinary days into memorable
              experiences.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing {
          min-height: 100vh;
          background: #f5f0e9;
          color: #302a25;
          position: relative;
          overflow: hidden;
        }

        .background {
          position: fixed;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .backgroundOne {
          top: -260px;
          left: -180px;
          background: #d9c1a5;
          opacity: 0.45;
        }

        .backgroundTwo {
          right: -250px;
          bottom: -250px;
          background: #cdb397;
          opacity: 0.3;
        }

        .hero {
          position: relative;
          z-index: 2;

          max-width: 1200px;
          min-height: 650px;

          margin: auto;
          padding: 80px 28px;

          display: grid;
          grid-template-columns: 1fr 420px;
          align-items: center;
          gap: 60px;
        }

        .eyebrow {
          display: inline-block;

          color: #9b7c5c;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: 0.18em;
        }

        h1 {
          margin: 20px 0;

          font-size: clamp(52px, 7vw, 88px);
          line-height: 0.94;
          letter-spacing: -5px;
        }

        h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
          color: #b07d4e;
        }

        .heroContent > p {
          max-width: 560px;

          color: #756a61;

          font-size: 16px;
          line-height: 1.8;

          margin-bottom: 32px;
        }

        .actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .primaryButton,
        .secondaryButton {
          height: 50px;
          padding: 0 22px;

          border-radius: 13px;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .primaryButton {
          border: 0;

          background: #39322c;
          color: #f8f4ef;
        }

        .primaryButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(50, 40, 30, 0.15);
        }

        .secondaryButton {
          border: 1px solid #d7ccc0;

          background: rgba(255, 255, 255, 0.5);

          color: #554a40;
        }

        .secondaryButton:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.8);
        }

        .heroVisual {
          position: relative;

          width: 380px;
          height: 380px;

          display: grid;
          place-items: center;
        }

        .circle {
          position: absolute;

          display: grid;
          place-items: center;

          border-radius: 50%;

          border: 1px solid rgba(126, 100, 75, 0.2);

          background: rgba(255, 255, 255, 0.3);

          backdrop-filter: blur(15px);

          color: #a58160;
        }

        .circleOne {
          width: 300px;
          height: 300px;

          font-size: 55px;
        }

        .circleTwo {
          width: 210px;
          height: 210px;

          background: rgba(222, 204, 182, 0.45);

          font-size: 70px;
        }

        .circleThree {
          width: 110px;
          height: 110px;

          background: #39322c;

          color: #e6b77e;

          font-size: 35px;

          box-shadow: 0 25px 60px rgba(50, 40, 30, 0.2);
        }

        .features {
          position: relative;
          z-index: 2;

          max-width: 1200px;

          margin: auto;

          padding: 0 28px 70px;

          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 15px;
        }

        .feature {
          display: flex;
          gap: 15px;
          align-items: flex-start;

          padding: 22px;

          border: 1px solid #ded4ca;

          border-radius: 20px;

          background: rgba(255, 255, 255, 0.48);

          backdrop-filter: blur(15px);
        }

        .featureIcon {
          flex-shrink: 0;

          width: 42px;
          height: 42px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          background: #e8ddd0;

          color: #806549;
        }

        .feature strong {
          display: block;

          margin-bottom: 5px;

          font-size: 14px;
        }

        .feature p {
          margin: 0;

          color: #8a7e74;

          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width: 850px) {
          .hero {
            grid-template-columns: 1fr;
            min-height: auto;

            padding-top: 70px;
            padding-bottom: 50px;
          }

          .heroVisual {
            width: 300px;
            height: 300px;

            margin: 0 auto;
          }

          .circleOne {
            width: 240px;
            height: 240px;
          }

          .circleTwo {
            width: 165px;
            height: 165px;
          }

          .circleThree {
            width: 90px;
            height: 90px;
          }

          .features {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .hero {
            padding: 55px 20px 40px;
          }

          h1 {
            font-size: 48px;
            letter-spacing: -3px;
          }

          .actions {
            flex-direction: column;
            align-items: stretch;
          }

          .primaryButton,
          .secondaryButton {
            width: 100%;
          }

          .features {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}</style>
    </main>
  );
}