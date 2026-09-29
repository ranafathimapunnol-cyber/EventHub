"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser, logout, User } from "../lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  function handleLogout() {
    logout();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="nav">
      <div className="navInner">

        {/* LOGO */}

        <button
          className="brand"
          onClick={() => router.push("/")}
        >
          <span className="brandIcon">E</span>

          <span className="brandName">
            Event<span>Hub</span>
          </span>
        </button>

        {/* DESKTOP NAV */}

        <nav className="desktopLinks">

          <button
            className={pathname === "/events" ? "active" : ""}
            onClick={() => router.push("/events")}
          >
            Discover
          </button>

          {user && (
            <button
              className={pathname === "/bookings" ? "active" : ""}
              onClick={() => router.push("/bookings")}
            >
              My Bookings
            </button>
          )}

          {user?.role === "organizer" && (
            <button
              className={pathname === "/organizer" ? "organizer active" : "organizer"}
              onClick={() => router.push("/organizer")}
            >
              ✦ Organizer
            </button>
          )}

        </nav>

        {/* RIGHT */}

        <div className="navRight">

          {!user ? (
            <>
              <button
                className="signIn"
                onClick={() => router.push("/login")}
              >
                Sign in
              </button>

              <button
                className="startButton"
                onClick={() => router.push("/register")}
              >
                Get started →
              </button>
            </>
          ) : (
            <>
              <button
                className="userButton"
                onClick={() => {
                  if (user.role === "organizer") {
                    router.push("/organizer");
                  }
                }}
              >
                <span className="avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </span>

                <span className="userDetails">
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </span>
              </button>

              <button
                className="logoutButton"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </div>

        {/* MOBILE */}

        <button
          className="mobileMenu"
          onClick={() => setOpen(!open)}
        >
          {open ? "×" : "☰"}
        </button>

      </div>

      {open && (
        <div className="mobilePanel">

          <button onClick={() => router.push("/events")}>
            Discover
          </button>

          {user && (
            <button onClick={() => router.push("/bookings")}>
              My Bookings
            </button>
          )}

          {user?.role === "organizer" && (
            <button onClick={() => router.push("/organizer")}>
              ✦ Organizer
            </button>
          )}

          {!user && (
            <>
              <button onClick={() => router.push("/login")}>
                Sign in
              </button>

              <button onClick={() => router.push("/register")}>
                Get started
              </button>
            </>
          )}

          {user && (
            <button onClick={handleLogout}>
              Logout
            </button>
          )}

        </div>
      )}

      <style jsx>{`
        .nav {
          height: 76px;
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(245, 241, 234, 0.88);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border-bottom: 1px solid #ded5cc;
        }

        .navInner {
          height: 100%;
          width: min(1180px, calc(100% - 40px));
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 0;
        }

        .brandIcon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #3b342d;
          color: #fff;
          font-weight: 800;
        }

        .brandName {
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.7px;
          color: #332c26;
        }

        .brandName span {
          color: #997653;
        }

        .desktopLinks {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .desktopLinks button {
          border: 0;
          background: transparent;
          color: #81766c;
          padding: 10px 14px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 600;
        }

        .desktopLinks button:hover,
        .desktopLinks button.active {
          background: #ebe4dc;
          color: #3b342d;
        }

        .desktopLinks .organizer {
          color: #8d7053;
        }

        .desktopLinks .organizer.active {
          background: #3b342d;
          color: white;
        }

        .navRight {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .signIn {
          border: 0;
          background: transparent;
          color: #6f6257;
          padding: 10px 13px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
        }

        .signIn:hover {
          background: #ebe4dc;
        }

        .startButton {
          border: 0;
          background: #3b342d;
          color: white;
          padding: 11px 16px;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 700;
        }

        .startButton:hover {
          background: #51473e;
        }

        .userButton {
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 12px;
        }

        .userButton:hover {
          background: #ebe4dc;
        }

        .avatar {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #3b342d;
          color: white;
          font-size: 13px;
          font-weight: 800;
        }

        .userDetails {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .userDetails strong {
          font-size: 12px;
          color: #3b342d;
        }

        .userDetails small {
          font-size: 10px;
          color: #997653;
          text-transform: capitalize;
        }

        .logoutButton {
          border: 1px solid #d8cec3;
          background: rgba(255,255,255,.5);
          color: #6f6257;
          padding: 9px 13px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .mobileMenu,
        .mobilePanel {
          display: none;
        }

        @media (max-width: 800px) {
          .desktopLinks {
            display: none;
          }

          .mobileMenu {
            display: block;
            border: 0;
            background: transparent;
            font-size: 25px;
            color: #3b342d;
          }

          .mobilePanel {
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 12px 20px 18px;
            background: rgba(245,241,234,.97);
            border-bottom: 1px solid #ded5cc;
          }

          .mobilePanel button {
            border: 0;
            background: transparent;
            padding: 13px;
            text-align: left;
            border-radius: 10px;
            color: #51483f;
            font-weight: 600;
          }

          .mobilePanel button:hover {
            background: #ebe4dc;
          }
        }

        @media (max-width: 520px) {
          .navInner {
            width: calc(100% - 30px);
          }

          .brandName {
            display: none;
          }

          .userDetails,
          .logoutButton {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
