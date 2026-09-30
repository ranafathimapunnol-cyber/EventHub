"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/api";
import { isLoggedIn } from "../../../lib/auth";

type Ticket = {
  price?: number;
  available?: number;
};

type Event = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  city?: string;
  date?: string;
  capacity?: number;
  ticket?: Ticket;
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
   * Get event ID safely.
   */
  const eventId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  /*
   * Load event.
   */
  useEffect(() => {
    if (!eventId) return;

    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/events/${eventId}/`);

        const data = response.data;

        console.log("EVENT API RESPONSE:", data);

        if (!data || typeof data !== "object") {
          throw new Error("Invalid event response.");
        }

        setEvent({
          ...data,
          ticket: data.ticket || {},
        });
      } catch (err: any) {
        console.error("EVENT LOAD ERROR:", err);

        setError(
          err?.response?.data?.error ||
            err?.response?.data?.detail ||
            err?.message ||
            "Unable to load event."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  /*
   * BOOK EVENT
   */
  async function handleBooking() {
    setError("");
    setMessage("");

    /*
     * Check login.
     */
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    if (!event) {
      setError("Event information is unavailable.");
      return;
    }

    const available = Number(event.ticket?.available ?? 0);

    /*
     * Check availability.
     */
    if (available <= 0) {
      setError("This event is sold out.");
      return;
    }

    /*
     * Prevent booking more tickets
     * than available.
     */
    if (quantity > available) {
      setError(
        `Only ${available} ${
          available === 1 ? "ticket" : "tickets"
        } available.`
      );

      setQuantity(available);

      return;
    }

    setBooking(true);

    try {
      /*
       * Send booking request.
       */
      const response = await api.post(
        `/bookings/${eventId}/`,
        {
          quantity: quantity,
        }
      );

      console.log("BOOKING RESPONSE:", response.data);

      /*
       * ------------------------------------------------
       * SUCCESS
       * ------------------------------------------------
       */

      /*
       * If backend returns the new available count,
       * use that value.
       *
       * Example backend response:
       *
       * {
       *   "message": "Booking successful",
       *   "available": 7
       * }
       */

      const backendAvailable =
        response.data?.available ??
        response.data?.event?.ticket?.available ??
        response.data?.event?.available ??
        null;

      /*
       * If backend gives us the new count,
       * use it.
       *
       * Otherwise calculate it locally.
       */
      const newAvailable =
        backendAvailable !== null
          ? Number(backendAvailable)
          : Math.max(0, available - quantity);

      /*
       * Update event state immediately.
       */
      setEvent((currentEvent) => {
        if (!currentEvent) {
          return currentEvent;
        }

        return {
          ...currentEvent,

          ticket: {
            ...(currentEvent.ticket || {}),
            available: newAvailable,
          },
        };
      });

      /*
       * Reset quantity.
       */
      setQuantity(1);

      /*
       * Show success message.
       */
      setMessage(
        response.data?.message ||
          `Booking successful! ${quantity} ${
            quantity === 1 ? "ticket" : "tickets"
          } booked.`
      );
    } catch (err: any) {
      console.error("BOOKING ERROR:", err);

      /*
       * IMPORTANT:
       * Print the complete backend response.
       *
       * This will tell us why the API
       * is returning 400.
       */
      console.error(
        "BACKEND ERROR RESPONSE:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Booking failed."
      );
    } finally {
      setBooking(false);
    }
  }

  /*
   * Increase quantity.
   */
  function increaseQuantity() {
    if (!event) return;

    const available = Number(
      event.ticket?.available ?? 0
    );

    setQuantity((current) => {
      if (current >= available) {
        return current;
      }

      return current + 1;
    });
  }

  /*
   * Decrease quantity.
   */
  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          <div className="loader" />
          <p>Loading event...</p>
        </div>
      </main>
    );
  }

  /*
   * ERROR
   */
  if (error && !event) {
    return (
      <main className="page">
        <div className="errorCard">
          <div className="errorIcon">!</div>

          <h1>Event unavailable</h1>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => router.push("/events")}
          >
            ← Back to events
          </button>
        </div>
      </main>
    );
  }

  if (!event) {
    return null;
  }

  /*
   * EVENT DATA
   */
  const price = Number(
    event.ticket?.price ?? 0
  );

  const available = Math.max(
    0,
    Number(event.ticket?.available ?? 0)
  );

  /*
   * Keep quantity within available tickets.
   */
  const safeQuantity =
    available > 0
      ? Math.min(quantity, available)
      : 1;

  const total = price * safeQuantity;

  /*
   * Format date.
   */
  const formattedDate = event.date
    ? new Date(event.date).toLocaleString(
        "en-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      )
    : "Date to be announced";

  /*
   * Progress percentage.
   */
  const progress =
    event.capacity && event.capacity > 0
      ? Math.min(
          100,
          (available / event.capacity) * 100
        )
      : 0;

  return (
    <main className="page">
      <div className="background backgroundOne" />
      <div className="background backgroundTwo" />

      <div className="container">

        {/* BACK */}
        <button
          type="button"
          className="back"
          onClick={() => router.push("/events")}
        >
          ← Back to events
        </button>

        <section className="hero">

          {/* EVENT INFORMATION */}
          <div className="heroContent">

            <span className="category">
              {event.category || "Event"}
            </span>

            <h1>{event.title}</h1>

            <p className="description">
              {event.description ||
                "Join us for this amazing event and create unforgettable memories."}
            </p>

            <div className="meta">

              {/* LOCATION */}
              <div className="metaItem">
                <span className="metaIcon">
                  ⌖
                </span>

                <div>
                  <small>LOCATION</small>

                  <strong>
                    {event.city ||
                      "Location TBA"}
                  </strong>
                </div>
              </div>

              {/* DATE */}
              <div className="metaItem">
                <span className="metaIcon">
                  ◷
                </span>

                <div>
                  <small>DATE</small>

                  <strong>
                    {formattedDate}
                  </strong>
                </div>
              </div>

              {/* AVAILABILITY */}
              <div className="metaItem">
                <span className="metaIcon">
                  ◇
                </span>

                <div>
                  <small>
                    AVAILABILITY
                  </small>

                  <strong
                    className={
                      available === 0
                        ? "soldOutText"
                        : ""
                    }
                  >
                    {available === 0
                      ? "Sold out"
                      : `${available} ${
                          available === 1
                            ? "ticket"
                            : "tickets"
                        } left`}
                  </strong>
                </div>
              </div>

            </div>
          </div>

          {/* BOOKING CARD */}
          <aside className="bookingCard">

            <p className="smallTitle">
              BOOK YOUR EXPERIENCE
            </p>

            {/* PRICE */}
            <div className="price">
              {price === 0
                ? "Free"
                : `₹${price.toLocaleString(
                    "en-IN"
                  )}`}

              {price > 0 && (
                <span>
                  / ticket
                </span>
              )}
            </div>

            {/* AVAILABILITY */}
            <div className="availabilityBox">

              <div className="availabilityTop">

                <span>
                  Tickets remaining
                </span>

                <strong>
                  {available}
                </strong>

              </div>

              <div className="progress">

                <div
                  className="progressBar"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

            {/* QUANTITY LABEL */}
            <div className="quantityLabel">

              <span>
                Quantity
              </span>

              <small>
                {available > 0
                  ? `${available} available`
                  : "Sold out"}
              </small>

            </div>

            {/* QUANTITY */}
            <div className="quantity">

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  booking ||
                  safeQuantity <= 1
                }
                aria-label="Decrease quantity"
              >
                −
              </button>

              <div className="quantityNumber">
                {safeQuantity}
              </div>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  booking ||
                  available === 0 ||
                  safeQuantity >= available
                }
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>

            {/* TOTAL */}
            <div className="total">

              <span>
                Total
              </span>

              <strong>
                {price === 0
                  ? "Free"
                  : `₹${total.toLocaleString(
                      "en-IN"
                    )}`}
              </strong>

            </div>

            {/* ERROR */}
            {error && (
              <div className="alert error">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {message && (
              <div className="alert success">
                {message}
              </div>
            )}

            {/* BOOK BUTTON */}
            <button
              type="button"
              className="bookButton"
              onClick={handleBooking}
              disabled={
                booking ||
                available === 0 ||
                safeQuantity > available
              }
            >
              {booking
                ? "Booking..."
                : available === 0
                ? "Sold out"
                : `Book ${safeQuantity} ${
                    safeQuantity === 1
                      ? "ticket"
                      : "tickets"
                  } →`}
            </button>

            {available > 0 && (
              <p className="secureText">
                🔒 Secure booking · Instant
                confirmation
              </p>
            )}

          </aside>
        </section>
      </div>

      <style jsx>{`

        .page {
          min-height: 100vh;
          background: #f5f1ea;
          color: #302a25;
          padding: 110px 24px 70px;
          position: relative;
          overflow: hidden;
        }

        .background {
          position: fixed;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .backgroundOne {
          top: -220px;
          left: -180px;
          background: #dcc7ad;
          opacity: 0.45;
        }

        .backgroundTwo {
          bottom: -220px;
          right: -180px;
          background: #cdb69e;
          opacity: 0.35;
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 1180px;
          margin: auto;
        }

        .back {
          border: 0;
          background: transparent;
          color: #806c59;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 28px;
          padding: 8px 0;
        }

        .back:hover {
          color: #40362d;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 35px;
          align-items: stretch;
        }

        .heroContent {
          min-height: 540px;
          padding: 55px;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid #ded4c9;
          backdrop-filter: blur(20px);
          box-shadow:
            0 25px 70px rgba(
              70,
              55,
              40,
              0.08
            );
        }

        .category {
          display: inline-block;
          padding: 8px 13px;
          border-radius: 999px;
          background: #e8ddd0;
          color: #80684e;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        h1 {
          font-size: clamp(
            42px,
            6vw,
            76px
          );
          line-height: 0.98;
          letter-spacing: -3px;
          margin: 28px 0;
          max-width: 750px;
        }

        .description {
          max-width: 650px;
          color: #74695f;
          font-size: 17px;
          line-height: 1.8;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 55px;
        }

        .metaItem {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          border-radius: 14px;
          background: rgba(
            255,
            255,
            255,
            0.7
          );
          border: 1px solid #e1d8ce;
        }

        .metaIcon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #eee4d9;
          color: #80684e;
          font-size: 15px;
        }

        .metaItem small {
          display: block;
          color: #a2978d;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
          margin-bottom: 3px;
        }

        .metaItem strong {
          display: block;
          color: #4a4038;
          font-size: 12px;
        }

        .soldOutText {
          color: #a6534d !important;
        }

        /* BOOKING CARD */

        .bookingCard {
          align-self: start;
          padding: 32px;
          border-radius: 28px;
          background: #332d27;
          color: #f8f3ed;
          box-shadow:
            0 25px 70px rgba(
              50,
              40,
              30,
              0.2
            );
        }

        .smallTitle {
          color: #b7a99b;
          font-size: 11px;
          letter-spacing: 0.15em;
          font-weight: 800;
          margin: 0;
        }

        .price {
          margin: 25px 0;
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .price span {
          font-size: 13px;
          color: #aaa098;
          font-weight: 400;
        }

        /* AVAILABILITY */

        .availabilityBox {
          padding: 14px;
          border-radius: 14px;
          background: rgba(
            255,
            255,
            255,
            0.045
          );
          border: 1px solid #51483f;
          margin-bottom: 20px;
        }

        .availabilityTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 9px;
        }

        .availabilityTop span {
          color: #aaa098;
          font-size: 11px;
        }

        .availabilityTop strong {
          color: #f0c38b;
          font-size: 13px;
        }

        .progress {
          width: 100%;
          height: 5px;
          overflow: hidden;
          border-radius: 999px;
          background: #4a423a;
        }

        .progressBar {
          height: 100%;
          border-radius: inherit;
          background: #e5b77d;
          transition:
            width 0.4s ease;
        }

        /* QUANTITY */

        .quantityLabel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .quantityLabel span {
          color: #e5ddd5;
          font-size: 12px;
          font-weight: 700;
        }

        .quantityLabel small {
          color: #8f877f;
          font-size: 10px;
        }

        .quantity {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #554b42;
          border-radius: 14px;
          padding: 6px;
          margin-bottom: 20px;
        }

        .quantity button {
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 10px;
          background: #51483f;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .quantity button:hover:not(
          :disabled
        ) {
          background: #65594e;
          transform: scale(1.04);
        }

        .quantity button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .quantityNumber {
          min-width: 50px;
          text-align: center;
          font-size: 18px;
          font-weight: 800;
          color: #f8f3ed;
        }

        /* TOTAL */

        .total {
          display: flex;
          justify-content: space-between;
          padding: 18px 0;
          border-top: 1px solid #514940;
          border-bottom: 1px solid #514940;
          color: #b9afa6;
          font-size: 13px;
        }

        .total strong {
          color: white;
          font-size: 17px;
        }

        /* BOOK BUTTON */

        .bookButton {
          width: 100%;
          height: 54px;
          margin-top: 20px;
          border: 0;
          border-radius: 14px;
          background: #e5b77d;
          color: #30251d;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .bookButton:hover:not(
          :disabled
        ) {
          background: #f0c58e;
          transform: translateY(-2px);
        }

        .bookButton:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .secureText {
          text-align: center;
          color: #827970;
          font-size: 9px;
          margin: 13px 0 0;
        }

        /* ALERTS */

        .alert {
          padding: 12px;
          border-radius: 10px;
          margin-top: 15px;
          font-size: 12px;
          line-height: 1.5;
        }

        .error {
          background: #fff0f0;
          color: #b64b4b;
        }

        .success {
          background: #e9f8ef;
          color: #38805a;
        }

        /* LOADING */

        .loading {
          max-width: 500px;
          margin: 150px auto;
          padding: 40px;
          text-align: center;
          border-radius: 25px;
          background: rgba(
            255,
            255,
            255,
            0.7
          );
          border: 1px solid #ded4ca;
        }

        .loader {
          width: 30px;
          height: 30px;
          margin: 0 auto 15px;
          border: 3px solid #ded4ca;
          border-top-color: #80664b;
          border-radius: 50%;
          animation:
            spin 0.7s linear infinite;
        }

        .loading p {
          color: #80756c;
          font-size: 13px;
        }

        /* ERROR CARD */

        .errorCard {
          max-width: 500px;
          margin: 150px auto;
          padding: 45px;
          text-align: center;
          border-radius: 25px;
          background: rgba(
            255,
            255,
            255,
            0.75
          );
          border: 1px solid #ded4ca;
        }

        .errorIcon {
          width: 55px;
          height: 55px;
          display: grid;
          place-items: center;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: #f5dfdc;
          color: #a6534d;
          font-weight: 900;
        }

        .errorCard h1 {
          font-size: 30px;
          letter-spacing: -1px;
          margin: 0 0 10px;
        }

        .errorCard p {
          color: #81766c;
          line-height: 1.6;
        }

        .errorCard button {
          margin-top: 20px;
          padding: 12px 20px;
          border: 0;
          border-radius: 10px;
          background: #332d27;
          color: white;
          cursor: pointer;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* TABLET */

        @media (max-width: 850px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .heroContent {
            min-height: auto;
            padding: 32px;
          }

          h1 {
            letter-spacing: -2px;
          }

          .bookingCard {
            width: 100%;
            box-sizing: border-box;
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .page {
            padding: 95px 15px 50px;
          }

          .heroContent {
            padding: 25px;
          }

          .meta {
            margin-top: 35px;
            flex-direction: column;
          }

          .metaItem {
            width: 100%;
            box-sizing: border-box;
          }

          h1 {
            font-size: 43px;
          }

          .bookingCard {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}
