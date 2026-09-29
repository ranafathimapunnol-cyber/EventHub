"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { getUser, isLoggedIn } from "../../lib/auth";

type EventTicket = {
  price?: number;
  available?: number;
};

type Event = {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  category?: string;
  city?: string;
  date?: string;
  capacity?: number;
  ticket?: EventTicket;
};

type User = {
  name?: string;
  email?: string;
  role?: string;
};

export default function OrganizerPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * IMPORTANT:
   * Do not call getUser() while rendering.
   * localStorage only exists in the browser.
   */
  useEffect(() => {
    setMounted(true);

    const loggedIn = isLoggedIn();

    if (!loggedIn) {
      router.replace("/login");
      return;
    }

    const currentUser = getUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    setUser(currentUser);

    if (currentUser.role !== "organizer") {
      router.replace("/events");
      return;
    }

    loadEvents();
  }, [router]);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events/");

      const data = response.data;

      let rawEvents: unknown[] = [];

      if (Array.isArray(data)) {
        rawEvents = data;
      } else if (Array.isArray(data?.events)) {
        rawEvents = data.events;
      }

      const validEvents: Event[] = rawEvents.filter(
        (item): item is Event => {
          if (!item || typeof item !== "object") {
            return false;
          }

          const event = item as Event;

          return Boolean(
            event.title &&
              typeof event.title === "string"
          );
        }
      );

      setEvents(validEvents);
    } catch (err: any) {
      console.error("LOAD ORGANIZER EVENTS ERROR:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Unable to load your events."
      );

      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !title.trim() ||
      !city.trim() ||
      !date ||
      !capacity ||
      price === ""
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    const capacityNumber = Number(capacity);
    const priceNumber = Number(price);

    if (
      !Number.isFinite(capacityNumber) ||
      capacityNumber <= 0
    ) {
      setError("Capacity must be greater than 0.");
      return;
    }

    if (
      !Number.isFinite(priceNumber) ||
      priceNumber < 0
    ) {
      setError("Ticket price cannot be negative.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/events/create/", {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        city: city.trim(),
        venue_name: city.trim(),
        date,
        capacity: capacityNumber,
        price: priceNumber,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      setSuccess(
        "Event published successfully."
      );

      setTitle("");
      setDescription("");
      setCategory("");
      setCity("");
      setDate("");
      setCapacity("");
      setPrice("");
      setTags("");

      await loadEvents();
    } catch (err: any) {
      console.error("CREATE EVENT ERROR:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Unable to create event."
      );
    } finally {
      setCreating(false);
    }
  }

  function getEventId(event: Event) {
    return event.id || event._id || "";
  }

  function openEvent(event: Event) {
    const id = getEventId(event);

    if (!id) {
      return;
    }

    router.push(`/events/${id}`);
  }

  const totalCapacity = events.reduce(
    (sum, event) =>
      sum + Number(event.capacity || 0),
    0
  );

  /*
   * Prevent rendering browser-dependent UI
   * until the client has mounted.
   */
  if (!mounted) {
    return (
      <main className="page">
        <div className="initialLoading">
          <div className="loader" />
          <p>Loading organizer space...</p>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f5f1ea;
            display: grid;
            place-items: center;
            color: #786d63;
          }

          .initialLoading {
            text-align: center;
          }

          .loader {
            width: 30px;
            height: 30px;
            margin: 0 auto 15px;
            border: 3px solid #ded4ca;
            border-top-color: #80664b;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }

          p {
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

  return (
    <main className="page">
      <div className="glow glowOne" />
      <div className="glow glowTwo" />

      <div className="container">

        {/* HEADER */}

        <section className="header">
          <div className="headerText">
            <span className="eyebrow">
              ORGANIZER SPACE
            </span>

            <h1>
              Create experiences
              <br />
              <em>people remember.</em>
            </h1>

            <p>
              Create, publish and manage your
              events from one beautiful workspace.
            </p>
          </div>

          {user && (
            <div className="profile">
              <div className="avatar">
                {(user.name || "O")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="profileText">
                <strong>
                  {user.name || "Organizer"}
                </strong>

                <span>
                  Event Organizer
                </span>
              </div>
            </div>
          )}
        </section>

        {/* STATS */}

        <section className="stats">

          <div className="stat">
            <div className="statTop">
              <span>EVENTS</span>
              <div className="statIcon">✦</div>
            </div>

            <strong>{events.length}</strong>

            <small>
              Published experiences
            </small>
          </div>

          <div className="stat">
            <div className="statTop">
              <span>CAPACITY</span>
              <div className="statIcon">◈</div>
            </div>

            <strong>{totalCapacity}</strong>

            <small>
              Total available seats
            </small>
          </div>

          <div className="stat">
            <div className="statTop">
              <span>ACCOUNT</span>
              <div className="statusDot" />
            </div>

            <strong>Live</strong>

            <small>
              Organizer account active
            </small>
          </div>

        </section>

        {/* MAIN */}

        <section className="mainGrid">

          {/* CREATE */}

          <div className="panel createPanel">

            <div className="panelHeader">
              <div>
                <span className="panelLabel">
                  NEW EXPERIENCE
                </span>

                <h2>
                  Create an event
                </h2>
              </div>

              <div className="panelIcon">
                +
              </div>
            </div>

            {error && (
              <div className="alert error">
                <span>!</span>
                {error}
              </div>
            )}

            {success && (
              <div className="alert success">
                <span>✓</span>
                {success}
              </div>
            )}

            <form onSubmit={handleCreate}>

              <div className="field">
                <label>
                  Event title *
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Kerala Sunset Music Festival"
                />
              </div>

              <div className="field">
                <label>
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Tell people what makes this event special..."
                  rows={4}
                />
              </div>

              <div className="twoColumns">

                <div className="field">
                  <label>
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="music">
                      Music
                    </option>

                    <option value="technology">
                      Technology
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

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>
                    City *
                  </label>

                  <input
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                    placeholder="Kannur"
                  />
                </div>

              </div>

              <div className="field">
                <label>
                  Venue
                </label>

                <input
                  value={city}
                  readOnly
                  placeholder="Event venue"
                />
              </div>

              <div className="field">
                <label>
                  Date & time *
                </label>

                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                />
              </div>

              <div className="twoColumns">

                <div className="field">
                  <label>
                    Capacity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) =>
                      setCapacity(
                        e.target.value
                      )
                    }
                    placeholder="100"
                  />
                </div>

                <div className="field">
                  <label>
                    Ticket price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="499"
                  />
                </div>

              </div>

              <div className="field">
                <label>
                  Tags
                </label>

                <input
                  value={tags}
                  onChange={(e) =>
                    setTags(e.target.value)
                  }
                  placeholder="music, kannur, weekend"
                />

                <small>
                  Separate tags with commas.
                </small>
              </div>

              <button
                type="submit"
                className="createButton"
                disabled={creating}
              >
                {creating
                  ? "Publishing..."
                  : "Publish event"}
                <span>→</span>
              </button>

            </form>
          </div>

          {/* EVENTS */}

          <div className="panel eventsPanel">

            <div className="panelHeader">
              <div>
                <span className="panelLabel">
                  YOUR EVENTS
                </span>

                <h2>
                  Published experiences
                </h2>
              </div>

              <button
                type="button"
                className="refresh"
                onClick={loadEvents}
                aria-label="Refresh events"
              >
                ↻
              </button>
            </div>

            {loading ? (
              <div className="empty">
                <div className="loader" />

                <p>
                  Loading your events...
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="empty">

                <div className="emptyIcon">
                  ✦
                </div>

                <h3>
                  No events yet
                </h3>

                <p>
                  Your published events
                  will appear here.
                </p>

              </div>
            ) : (
              <div className="eventList">

                {events.map((event, index) => {
                  const eventId =
                    getEventId(event);

                  const price =
                    event.ticket?.price ?? 0;

                  const available =
                    event.ticket?.available ??
                    event.capacity ??
                    0;

                  return (
                    <article
                      className="event"
                      key={
                        eventId ||
                        `event-${index}`
                      }
                      onClick={() =>
                        openEvent(event)
                      }
                    >

                      <div className="eventIcon">
                        ✦
                      </div>

                      <div className="eventInfo">

                        <span>
                          {event.category ||
                            "EVENT"}
                        </span>

                        <h3>
                          {event.title ||
                            "Untitled event"}
                        </h3>

                        <p>
                          <span>⌖</span>
                          {event.city ||
                            "Location TBA"}
                        </p>

                      </div>

                      <div className="eventRight">

                        <strong>
                          ₹
                          {Number(
                            price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <small>
                          {available}{" "}
                          available
                        </small>

                        <b>
                          →
                        </b>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </div>

        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 5% 5%,
              rgba(208, 181, 151, 0.35),
              transparent 28%
            ),
            radial-gradient(
              circle at 95% 90%,
              rgba(193, 164, 132, 0.25),
              transparent 30%
            ),
            #f5f1ea;
          color: #302a25;
          padding: 55px 24px 90px;
          position: relative;
          overflow: hidden;
        }

        .container {
          width: min(1250px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .glow {
          position: fixed;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
        }

        .glowOne {
          top: -250px;
          left: -180px;
          background: #d8bfa4;
          opacity: 0.35;
        }

        .glowTwo {
          right: -200px;
          bottom: -250px;
          background: #ccb397;
          opacity: 0.28;
        }

        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 35px;
        }

        .eyebrow,
        .panelLabel {
          color: #997653;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        h1 {
          margin: 14px 0;
          font-size: clamp(42px, 6vw, 72px);
          line-height: 0.98;
          letter-spacing: -3.5px;
        }

        h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
          color: #997653;
        }

        .headerText p {
          margin: 0;
          max-width: 560px;
          color: #7f7469;
          font-size: 14px;
          line-height: 1.7;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 16px 9px 9px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid #ded4ca;
          border-radius: 18px;
          box-shadow: 0 10px 35px rgba(70, 55, 40, 0.05);
        }

        .avatar {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #39322c;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
        }

        .profileText strong,
        .profileText span {
          display: block;
        }

        .profileText strong {
          color: #3a332d;
          font-size: 13px;
        }

        .profileText span {
          margin-top: 3px;
          color: #978b80;
          font-size: 10px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .stat {
          padding: 21px 23px;
          border: 1px solid #ded4ca;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(18px);
          box-shadow: 0 12px 35px rgba(70, 55, 40, 0.04);
        }

        .statTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .statTop > span {
          color: #9b8064;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .statIcon {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #e9ded2;
          color: #806549;
          font-size: 12px;
        }

        .statusDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #78916d;
          box-shadow: 0 0 0 5px rgba(120, 145, 109, 0.12);
        }

        .stat strong {
          display: block;
          margin: 9px 0 2px;
          color: #39322c;
          font-size: 27px;
        }

        .stat small {
          color: #978c82;
          font-size: 10px;
        }

        .mainGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 20px;
        }

        .panel {
          border: 1px solid #ded4ca;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.62);
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 70px rgba(70, 55, 40, 0.06);
          padding: 27px;
        }

        .panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .panelHeader h2 {
          margin: 7px 0 0;
          color: #38312b;
          font-size: 22px;
          letter-spacing: -0.7px;
        }

        .panelIcon,
        .refresh {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 12px;
          background: #e9ded2;
          color: #755d45;
          font-size: 21px;
        }

        .refresh {
          cursor: pointer;
          transition: 0.2s ease;
        }

        .refresh:hover {
          transform: rotate(25deg);
          background: #ded0c1;
        }

        .field {
          margin-bottom: 15px;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #61564d;
          font-size: 11px;
          font-weight: 800;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d9cec2;
          outline: none;
          border-radius: 11px;
          background: rgba(250, 248, 245, 0.9);
          color: #302a25;
          padding: 12px 13px;
          font-family: inherit;
          font-size: 12px;
          transition: 0.2s;
        }

        .field textarea {
          resize: vertical;
          min-height: 95px;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #a18363;
          box-shadow: 0 0 0 4px rgba(161, 131, 99, 0.09);
        }

        .field small {
          display: block;
          margin-top: 5px;
          color: #a0978f;
          font-size: 9px;
        }

        .twoColumns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .createButton {
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 4px;
          border: 0;
          border-radius: 12px;
          background: #39322c;
          color: #f8f4ef;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .createButton:hover {
          background: #4b4037;
          transform: translateY(-1px);
        }

        .createButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .createButton span {
          font-size: 16px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 13px;
          margin-bottom: 16px;
          border-radius: 11px;
          font-size: 11px;
        }

        .alert span {
          font-weight: 900;
        }

        .error {
          border: 1px solid #f0d0cd;
          background: #fff0ef;
          color: #a8534e;
        }

        .success {
          border: 1px solid #cee7d5;
          background: #edf8f0;
          color: #47805d;
        }

        .eventList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .event {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border: 1px solid #e2d8ce;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.62);
          cursor: pointer;
          transition: 0.2s ease;
        }

        .event:hover {
          transform: translateY(-2px);
          border-color: #c8b39c;
          box-shadow: 0 12px 30px rgba(70, 55, 40, 0.07);
        }

        .eventIcon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #e8ddd0;
          color: #806549;
          font-size: 17px;
        }

        .eventInfo {
          min-width: 0;
          flex: 1;
        }

        .eventInfo > span {
          color: #a08467;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .eventInfo h3 {
          overflow: hidden;
          margin: 4px 0;
          color: #403830;
          font-size: 13px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .eventInfo p {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0;
          color: #968b81;
          font-size: 10px;
        }

        .eventInfo p span {
          color: #9a7b5b;
        }

        .eventRight {
          min-width: 70px;
          text-align: right;
        }

        .eventRight strong,
        .eventRight small,
        .eventRight b {
          display: block;
        }

        .eventRight strong {
          color: #443a31;
          font-size: 12px;
        }

        .eventRight small {
          margin-top: 3px;
          color: #9a9087;
          font-size: 8px;
        }

        .eventRight b {
          margin-top: 4px;
          color: #a07e5d;
          font-size: 13px;
        }

        .empty {
          min-height: 330px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          color: #93887e;
        }

        .emptyIcon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin-bottom: 13px;
          border-radius: 18px;
          background: #e8ded2;
          color: #80664b;
          font-size: 20px;
        }

        .empty h3 {
          margin: 0;
          color: #4b423a;
          font-size: 16px;
        }

        .empty p {
          max-width: 260px;
          margin: 7px 0 0;
          color: #958a81;
          font-size: 11px;
          line-height: 1.6;
        }

        .loader {
          width: 27px;
          height: 27px;
          margin-bottom: 13px;
          border: 3px solid #ded4ca;
          border-top-color: #80664b;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .initialLoading {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        @media (max-width: 950px) {
          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .mainGrid {
            grid-template-columns: 1fr;
          }

          .profile {
            align-self: flex-start;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 35px 14px 60px;
          }

          h1 {
            font-size: 43px;
            letter-spacing: -2.5px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .panel {
            padding: 20px;
            border-radius: 22px;
          }

          .twoColumns {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .eventRight {
            min-width: 55px;
          }

          .eventInfo h3 {
            font-size: 12px;
          }
        }
      `}</style>
    </main>
  );
}