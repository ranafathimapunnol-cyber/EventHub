
"use client";

import { useRouter } from "next/navigation";

export interface EventTicket {
  price?: number | null;
  available?: number | null;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  city?: string | null;
  date?: string | null;
  capacity?: number | null;
  ticket?: EventTicket | null;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  // Runtime safety: never try to render a missing event.
  if (!event || typeof event !== "object") {
    return null;
  }

  const date = event.date ? new Date(event.date) : null;

  const validDate =
    date !== null && !Number.isNaN(date.getTime());

  const day = validDate
    ? date!.getDate().toString().padStart(2, "0")
    : "--";

  const month = validDate
    ? date!
        .toLocaleDateString("en-US", {
          month: "short",
        })
        .toUpperCase()
    : "DATE";

  const formattedDate = validDate
    ? date!.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date to be announced";

  const price =
    event.ticket?.price !== undefined &&
    event.ticket?.price !== null
      ? Number(event.ticket.price)
      : null;

  const available =
    event.ticket?.available !== undefined &&
    event.ticket?.available !== null
      ? Number(event.ticket.available)
      : null;

  const category =
    event.category
      ?.toString()
      .replace(/_/g, " ")
      .trim() || "Event";

  const location =
    event.city?.toString().trim() || "Location TBA";

  const title =
    event.title?.toString().trim() || "Untitled Event";

  const description =
    event.description?.toString().trim() ||
    "An experience waiting to be discovered.";

  function openEvent() {
    if (!event.id) return;

    router.push(`/events/${encodeURIComponent(event.id)}`);
  }

  return (
    <article
      className="card"
      onClick={openEvent}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openEvent();
        }
      }}
    >
      {/* VISUAL */}
      <div className="visual">
        <div className="visualGlow" />

        <div className="visualCircle circleOne" />

        <div className="visualCircle circleTwo" />

        <div className="dateBadge">
          <strong>{day}</strong>
          <span>{month}</span>
        </div>

        <div className="visualSymbol">✦</div>

        <span className="category">
          {category}
        </span>
      </div>

      {/* CONTENT */}
      <div className="content">
        <div className="location">
          <span>⌖</span>
          {location}
        </div>

        <h3>{title}</h3>

        <p>
          {description.length > 105
            ? `${description.slice(0, 105)}...`
            : description}
        </p>

        <div className="dateRow">
          <span className="calendar">◷</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="price">
          <span className="priceLabel">
            TICKET
          </span>

          <strong>
            {price === null || price === 0
              ? "Free"
              : `₹${price.toLocaleString("en-IN")}`}
          </strong>
        </div>

        {available !== null && (
          <div className="availability">
            <span className="availabilityDot" />
            {available} left
          </div>
        )}

        <button
          type="button"
          className="arrow"
          onClick={(e) => {
            e.stopPropagation();
            openEvent();
          }}
          aria-label={`View ${title}`}
        >
          →
        </button>
      </div>

      <style jsx>{`
        .card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid #ddd3c8;
          background: rgba(255, 255, 255, 0.58);
          box-shadow:
            0 12px 35px rgba(71, 55, 41, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .card:hover {
          transform: translateY(-6px);
          border-color: #c8b29b;
          box-shadow:
            0 24px 55px rgba(71, 55, 41, 0.13),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .visual {
          height: 178px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 75% 20%,
              rgba(179, 141, 103, 0.28),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              #e9ded1 0%,
              #ded0c1 52%,
              #d2c0ad 100%
            );
        }

        .visualGlow {
          position: absolute;
          width: 150px;
          height: 150px;
          right: -35px;
          top: -50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.32);
          filter: blur(10px);
        }

        .visualCircle {
          position: absolute;
          border: 1px solid rgba(115, 88, 63, 0.16);
          border-radius: 50%;
        }

        .circleOne {
          width: 190px;
          height: 190px;
          right: -55px;
          top: -45px;
        }

        .circleTwo {
          width: 120px;
          height: 120px;
          left: -35px;
          bottom: -55px;
          border-style: dashed;
        }

        .visualSymbol {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-family: Georgia, serif;
          font-size: 72px;
          color: rgba(71, 55, 41, 0.12);
        }

        .dateBadge {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 52px;
          height: 58px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 20px rgba(70, 53, 38, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .dateBadge strong {
          color: #40372f;
          font-family: Georgia, serif;
          font-size: 22px;
          line-height: 1;
        }

        .dateBadge span {
          margin-top: 4px;
          color: #997653;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .category {
          position: absolute;
          right: 15px;
          bottom: 14px;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(59, 52, 45, 0.88);
          color: #f7f2ec;
          font-size: 9px;
          font-weight: 700;
          text-transform: capitalize;
          letter-spacing: 0.4px;
          backdrop-filter: blur(8px);
        }

        .content {
          padding: 20px 20px 16px;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #997653;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .location span {
          font-size: 14px;
        }

        h3 {
          margin: 9px 0 8px;
          color: #342d27;
          font-size: 20px;
          line-height: 1.18;
          letter-spacing: -0.6px;
        }

        p {
          margin: 0;
          min-height: 39px;
          color: #8b8075;
          font-size: 12px;
          line-height: 1.65;
        }

        .dateRow {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          padding-top: 14px;
          border-top: 1px solid #e5ddd5;
          color: #786b5e;
          font-size: 11px;
        }

        .calendar {
          color: #997653;
          font-size: 16px;
        }

        .footer {
          min-height: 58px;
          padding: 11px 16px 13px 20px;
          border-top: 1px solid #e2d9d0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .price {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .priceLabel {
          color: #a39990;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .price strong {
          color: #443a31;
          font-size: 14px;
        }

        .availability {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          color: #8d8176;
          font-size: 9px;
        }

        .availabilityDot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #78916d;
          box-shadow:
            0 0 0 3px rgba(120, 145, 109, 0.12);
        }

        .arrow {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border: 1px solid #d7ccc1;
          border-radius: 11px;
          background: #f8f4ef;
          color: #4a3f35;
          font-size: 17px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .card:hover .arrow {
          background: #3b342d;
          color: white;
          border-color: #3b342d;
          transform: translateX(2px);
        }

        @media (max-width: 600px) {
          .visual {
            height: 165px;
          }

          h3 {
            font-size: 19px;
          }
        }
      `}</style>
    </article>
  );
}
