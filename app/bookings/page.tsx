"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import { getToken } from "../../lib/auth";

interface Booking {
  id: string;
  event_id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login to view your bookings.");
        return;
      }

      const response = await api.get("/bookings/my/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setBookings(data);
      } else if (Array.isArray(data?.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error("Bookings error:", err);

      setBookings([]);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(bookingId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      await api.delete(`/bookings/${bookingId}/cancel/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadBookings();
    } catch (err: any) {
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Unable to cancel booking."
      );
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <main className="page">
      <div className="background backgroundOne" />
      <div className="background backgroundTwo" />

      <section className="container">
        {/* PAGE HEADING */}
        <div className="heading">
          <div>
            <p className="eyebrow">YOUR EXPERIENCE</p>

            <h1>My Bookings</h1>

            <p className="subtitle">
              Keep track of the experiences you've reserved.
            </p>
          </div>

          <Link href="/events" className="browseButton">
            Browse events →
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="state">
            <div className="spinner" />
            <p>Loading your bookings...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="errorBox">
            <div className="errorIcon">!</div>

            <div className="errorContent">
              <strong>{error}</strong>

              <p>
                Please make sure you're logged in and try again.
              </p>
            </div>

            <Link href="/login" className="loginButton">
              Sign in
            </Link>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && bookings.length === 0 && (
          <div className="empty">
            <div className="emptyIcon">✦</div>

            <h2>No bookings yet</h2>

            <p>
              Your next memorable experience is waiting for you.
            </p>

            <Link href="/events" className="browseButton">
              Discover events →
            </Link>
          </div>
        )}

        {/* BOOKINGS */}
        {!loading && !error && bookings.length > 0 && (
          <div className="list">
            {bookings.map((booking) => {
              const bookingDate = new Date(booking.created_at);

              const formattedDate = Number.isNaN(
                bookingDate.getTime()
              )
                ? "—"
                : bookingDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

              const eventId = String(
                booking.event_id ?? ""
              );

              const bookingId = String(
                booking.id ?? ""
              );

              const status =
                booking.status?.toLowerCase() || "unknown";

              return (
                <article
                  className="booking"
                  key={bookingId}
                >
                  {/* SYMBOL */}
                  <div className="symbol">
                    ✦
                  </div>

                  {/* DETAILS */}
                  <div className="details">
                    <div className="top">
                      <div>
                        <p className="label">
                          BOOKING
                        </p>

                        <h2>
                          Event #
                          {eventId
                            ? eventId.slice(-6)
                            : "------"}
                        </h2>
                      </div>

                      <span
                        className={`status ${
                          status === "confirmed"
                            ? "confirmed"
                            : status === "cancelled"
                            ? "cancelled"
                            : "pending"
                        }`}
                      >
                        {booking.status || "Unknown"}
                      </span>
                    </div>

                    {/* BOOKING INFO */}
                    <div className="info">
                      <div>
                        <span>Tickets</span>

                        <strong>
                          {Number(
                            booking.quantity || 0
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Total</span>

                        <strong>
                          ₹
                          {Number(
                            booking.total_price || 0
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </div>

                      <div>
                        <span>Booked</span>

                        <strong>
                          {formattedDate}
                        </strong>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="bottom">
                      <span className="bookingId">
                        ID: {bookingId || "N/A"}
                      </span>

                      {status === "confirmed" && (
                        <button
                          type="button"
                          onClick={() =>
                            cancelBooking(bookingId)
                          }
                          className="cancelButton"
                        >
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f1ea;
          color: #302a25;
          position: relative;
          overflow: hidden;
          padding-bottom: 100px;
        }

        .background {
          position: fixed;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.35;
        }

        .backgroundOne {
          top: -180px;
          left: -160px;
          background: #dccab6;
        }

        .backgroundTwo {
          right: -180px;
          bottom: -180px;
          background: #d8c3aa;
        }

        .container {
          width: min(1050px, calc(100% - 40px));
          margin: 0 auto;
          padding: 65px 0 100px;
          position: relative;
          z-index: 2;
        }

        /* HEADING */

        .heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 38px;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #9a8065;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 58px);
          line-height: 1;
          letter-spacing: -2.5px;
        }

        .subtitle {
          margin: 14px 0 0;
          color: #81766c;
          font-size: 15px;
        }

        .browseButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 20px;
          border-radius: 12px;
          background: #3b342d;
          color: #f8f5f1;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .browseButton:hover {
          background: #51473e;
          transform: translateY(-1px);
        }

        /* BOOKING LIST */

        .list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .booking {
          display: flex;
          gap: 20px;
          padding: 22px;
          border: 1px solid #ddd3c9;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.62);
          backdrop-filter: blur(18px);
          box-shadow:
            0 15px 45px rgba(70, 55, 40, 0.06);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .booking:hover {
          transform: translateY(-2px);
          border-color: #c8b39c;
          box-shadow:
            0 20px 55px rgba(70, 55, 40, 0.1);
        }

        .symbol {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #e8ded2;
          color: #8d7053;
          font-size: 21px;
        }

        .details {
          flex: 1;
          min-width: 0;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .label {
          margin: 0 0 5px;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #a29384;
          font-weight: 800;
        }

        h2 {
          margin: 0;
          font-size: 19px;
          letter-spacing: -0.4px;
        }

        /* STATUS */

        .status {
          min-height: 28px;
          padding: 0 11px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .confirmed {
          background: #e6f3ea;
          color: #3f8057;
        }

        .cancelled {
          background: #f8e7e5;
          color: #a45b54;
        }

        .pending {
          background: #f6eddc;
          color: #967143;
        }

        /* INFO */

        .info {
          display: flex;
          gap: 45px;
          margin-top: 22px;
        }

        .info div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info span {
          color: #a0968d;
          font-size: 11px;
        }

        .info strong {
          color: #4a4038;
          font-size: 14px;
        }

        /* BOTTOM */

        .bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e6ded6;
        }

        .bookingId {
          color: #a49a91;
          font-size: 11px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 70%;
        }

        .cancelButton {
          border: 1px solid #e0c8c4;
          background: transparent;
          color: #a45b54;
          border-radius: 9px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .cancelButton:hover {
          background: #f8e7e5;
          border-color: #d9b6b1;
        }

        /* LOADING / EMPTY */

        .state,
        .empty {
          min-height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1px solid #ddd3c9;
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.5);
        }

        .state p {
          color: #81766c;
          font-size: 14px;
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #ded4ca;
          border-top-color: #806548;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .emptyIcon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: #e8ded2;
          color: #8d7053;
          font-size: 27px;
          margin-bottom: 20px;
        }

        .empty h2 {
          font-size: 25px;
          margin: 0;
        }

        .empty p {
          color: #81766c;
          margin: 8px 0 24px;
        }

        /* ERROR */

        .errorBox {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border-radius: 20px;
          border: 1px solid #e8c9c5;
          background: #fff5f3;
          color: #8f4f49;
        }

        .errorContent {
          min-width: 0;
        }

        .errorBox p {
          margin: 5px 0 0;
          color: #a97872;
          font-size: 13px;
        }

        .errorIcon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f2d8d4;
          font-weight: 900;
        }

        .loginButton {
          margin-left: auto;
          color: #704e39;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .loginButton:hover {
          text-decoration: underline;
        }

        /* MOBILE */

        @media (max-width: 650px) {
          .container {
            width: min(100% - 28px, 1050px);
            padding-top: 40px;
          }

          .heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .booking {
            padding: 17px;
          }

          .symbol {
            width: 42px;
            height: 42px;
          }

          .info {
            gap: 20px;
            flex-wrap: wrap;
          }

          .bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .bookingId {
            max-width: 100%;
          }

          .cancelButton {
            width: 100%;
          }

          .errorBox {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .loginButton {
            margin-left: 55px;
          }
        }
      `}</style>
    </main>
  );
}