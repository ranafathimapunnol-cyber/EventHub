
"use client";

import { useEffect, useMemo, useState } from "react";

import api from "../../lib/api";
import EventCard, {
  Event,
} from "../../components/EventCard";

import Loading from "../../components/Loading";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  const [search, setSearch] =
    useState<string>("");

  const [category, setCategory] =
    useState<string>("");

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const params: Record<
        string,
        string | number
      > = {
        page: 1,
        limit: 50,
      };

      if (category) {
        params.category = category;
      }

      const response = await api.get(
        "/events/",
        {
          params,
        }
      );

      console.log(
        "EVENT API RESPONSE:",
        response.data
      );

      /*
       * Backend may return:
       *
       * {
       *   events: [...]
       * }
       *
       * OR:
       *
       * [...]
       */

      const rawEvents: unknown[] =
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(
              response.data?.events
            )
          ? response.data.events
          : [];

      /*
       * Keep ONLY valid event objects.
       *
       * This prevents undefined/null values
       * from reaching EventCard.
       */

      const validEvents: Event[] =
        rawEvents.filter(
          (
            item: unknown
          ): item is Event => {
            if (
              !item ||
              typeof item !== "object"
            ) {
              return false;
            }

            const event =
              item as Record<
                string,
                unknown
              >;

            return (
              typeof event.id ===
                "string" &&
              event.id.length > 0 &&
              typeof event.title ===
                "string" &&
              event.title.length > 0
            );
          }
        );

      setEvents(validEvents);
    } catch (err: unknown) {
      console.error(
        "LOAD EVENTS ERROR:",
        err
      );

      let message =
        "Could not load events. Make sure the backend is running.";

      if (
        typeof err === "object" &&
        err !== null
      ) {
        const error = err as {
          response?: {
            data?: {
              error?: string;
              detail?: string;
            };
          };
          message?: string;
        };

        message =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.message ||
          message;
      }

      setError(message);

      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [category]);

  /*
   * Client-side search.
   */

  const filteredEvents =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return events;
      }

      return events.filter(
        (event) => {
          const searchableText = [
            event.title,
            event.description,
            event.city,
            event.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }, [events, search]);

  return (
    <main className="page">
      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">
            EVENTS • EXPERIENCES • MEMORIES
          </span>

          <h1>
            Find your next
            <br />
            <em>great moment.</em>
          </h1>

          <p>
            Discover events happening around
            you. From intimate gatherings to
            unforgettable experiences.
          </p>
        </div>

        <div
          className="heroMark"
          aria-hidden="true"
        >
          <span>✦</span>
          <span>◈</span>
          <span>✧</span>
        </div>
      </section>

      {/* ================= SEARCH ================= */}

      <section className="toolbar">
        <div className="search">
          <span className="searchIcon">
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search events, cities, categories..."
            aria-label="Search events"
          />

          {search && (
            <button
              type="button"
              className="clearSearch"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          aria-label="Filter by category"
        >
          <option value="">
            All categories
          </option>

          <option value="music">
            Music
          </option>

          <option value="conference">
            Conference
          </option>

          <option value="workshop">
            Workshop
          </option>

          <option value="sports">
            Sports
          </option>

          <option value="festival">
            Festival
          </option>

          <option value="technology">
            Technology
          </option>
        </select>
      </section>

      {/* ================= EVENTS ================= */}

      <section className="eventsSection">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">
              EXPLORE
            </span>

            <h2>
              Upcoming events
            </h2>
          </div>

          <span className="count">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1
              ? "event"
              : "events"}
          </span>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="loadingWrapper">
            <Loading />
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="state errorState">
            <div className="stateIcon">
              !
            </div>

            <h3>
              Something went wrong
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadEvents}
            >
              Try again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredEvents.length === 0 && (
            <div className="state">
              <div className="stateIcon">
                ◌
              </div>

              <h3>
                No events found
              </h3>

              <p>
                {search || category
                  ? "Try changing your search or category."
                  : "There are no upcoming events yet."}
              </p>

              {(search || category) && (
                <button
                  type="button"
                  className="resetButton"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

        {/* EVENTS */}

        {!loading &&
          !error &&
          filteredEvents.length > 0 && (
            <div className="grid">
              {filteredEvents.map(
                (event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                )
              )}
            </div>
          )}
      </section>

      <style jsx>{`
        /* ================= PAGE ================= */

        .page {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 85% 5%,
              rgba(179, 141, 103, 0.13),
              transparent 30%
            ),
            radial-gradient(
              circle at 5% 40%,
              rgba(214, 194, 172, 0.18),
              transparent 28%
            ),
            #f5f1ea;

          color: #3b342d;
        }

        /* ================= HERO ================= */

        .hero {
          width: min(
            1200px,
            calc(100% - 56px)
          );

          min-height: 390px;

          margin: 0 auto;

          padding: 65px 0 45px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 50px;
        }

        .heroCopy {
          max-width: 650px;
        }

        .eyebrow {
          display: inline-block;

          color: #997653;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        h1 {
          margin: 18px 0;

          color: #3b342d;

          font-size: clamp(
            48px,
            7vw,
            82px
          );

          line-height: 0.95;

          letter-spacing: -5px;
        }

        h1 em {
          color: #997653;

          font-family: Georgia, serif;

          font-weight: 400;
        }

        .heroCopy p {
          max-width: 510px;

          margin: 0;

          color: #8b8075;

          line-height: 1.8;

          font-size: 15px;
        }

        /* ================= HERO MARK ================= */

        .heroMark {
          width: 245px;
          height: 245px;

          flex-shrink: 0;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          transform: rotate(-10deg);

          background:
            radial-gradient(
              circle,
              rgba(179, 141, 103, 0.2),
              transparent 65%
            );

          color: rgba(
            153,
            118,
            83,
            0.28
          );

          font-size: 44px;
        }

        .heroMark span:nth-child(2) {
          font-size: 72px;
        }

        /* ================= TOOLBAR ================= */

        .toolbar {
          width: min(
            1200px,
            calc(100% - 56px)
          );

          margin: 0 auto;

          display: flex;

          gap: 12px;

          padding-bottom: 55px;
        }

        .search {
          flex: 1;

          height: 52px;

          display: flex;

          align-items: center;

          gap: 10px;

          padding: 0 15px;

          border-radius: 14px;

          border: 1px solid #ddd3c8;

          background:
            rgba(
              255,
              255,
              255,
              0.58
            );

          box-shadow:
            inset 0 1px 0
              rgba(255, 255, 255, 0.8);

          backdrop-filter: blur(14px);
        }

        .searchIcon {
          color: #997653;

          font-size: 22px;

          line-height: 1;
        }

        .search input {
          flex: 1;

          min-width: 0;

          border: 0;

          outline: 0;

          background: transparent;

          color: #3b342d;

          font-size: 13px;
        }

        .search input::placeholder {
          color: #a39990;
        }

        .clearSearch {
          width: 27px;
          height: 27px;

          border: 0;

          border-radius: 50%;

          background: #ebe3da;

          color: #6f6257;

          cursor: pointer;

          font-size: 17px;

          line-height: 1;
        }

        select {
          width: 175px;

          height: 52px;

          padding: 0 14px;

          border-radius: 14px;

          border: 1px solid #ddd3c8;

          outline: 0;

          background:
            rgba(
              255,
              255,
              255,
              0.58
            );

          color: #3b342d;

          font-size: 13px;

          cursor: pointer;

          backdrop-filter: blur(14px);
        }

        option {
          background: #f5f1ea;

          color: #3b342d;
        }

        /* ================= SECTION ================= */

        .eventsSection {
          width: min(
            1200px,
            calc(100% - 56px)
          );

          margin: 0 auto;

          padding-bottom: 80px;
        }

        .sectionHeading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: 25px;
        }

        h2 {
          margin: 7px 0 0;

          color: #3b342d;

          font-size: 30px;

          letter-spacing: -1px;
        }

        .count {
          color: #8b8075;

          font-size: 12px;

          font-weight: 600;
        }

        /* ================= GRID ================= */

        .grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 20px;
        }

        /* ================= STATES ================= */

        .loadingWrapper {
          min-height: 320px;

          display: grid;

          place-items: center;
        }

        .state {
          min-height: 320px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: #8b8075;
        }

        .stateIcon {
          width: 56px;
          height: 56px;

          display: grid;

          place-items: center;

          margin-bottom: 15px;

          border-radius: 50%;

          background:
            rgba(
              153,
              118,
              83,
              0.1
            );

          color: #997653;

          font-size: 24px;
        }

        .state h3 {
          margin: 0 0 6px;

          color: #40372f;

          font-size: 18px;
        }

        .state p {
          max-width: 450px;

          margin: 0;

          color: #8b8075;

          font-size: 13px;

          line-height: 1.6;
        }

        .state button {
          margin-top: 18px;

          padding: 11px 18px;

          border: 0;

          border-radius: 11px;

          background: #3b342d;

          color: white;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .state button:hover {
          background: #51473e;

          transform: translateY(-1px);
        }

        .resetButton {
          background: #997653 !important;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 900px) {
          .heroMark {
            width: 190px;
            height: 190px;
          }

          .heroMark span:nth-child(2) {
            font-size: 55px;
          }

          .grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .hero {
            width: min(
              100% - 36px,
              600px
            );

            padding-top: 50px;
          }

          .heroMark {
            display: none;
          }

          .toolbar,
          .eventsSection {
            width: min(
              100% - 36px,
              600px
            );
          }

          .toolbar {
            flex-direction: column;
          }

          select {
            width: 100%;
          }
        }

        @media (max-width: 560px) {
          .grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 50px;

            letter-spacing: -3px;
          }

          h2 {
            font-size: 26px;
          }

          .sectionHeading {
            align-items: flex-start;

            flex-direction: column;

            gap: 8px;
          }
        }
      `}
      </style>
    </main>
  );
}
