"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { getAuth } from "../../../lib/auth";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const auth = getAuth();

      if (!auth) {
        router.push("/login");
        return;
      }

      if (auth.user?.role !== "organizer") {
        setError("Organizer access required.");
        return;
      }

      await api.post("/events/create/", {
        title,
        description,
        category,
        venue_name: venueName,
        city,
        date,
        capacity: Number(capacity),
        price: Number(price),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      router.push("/organizer");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Failed to create event."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f1ea] px-5 py-10 text-[#302a25]">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/organizer")}
          className="mb-8 text-sm font-medium text-[#80664d] hover:text-[#4f4034]"
        >
          ← Back to organizer dashboard
        </button>

        <div className="overflow-hidden rounded-[30px] border border-[#ddd3c8] bg-white/70 shadow-[0_25px_80px_rgba(70,55,40,0.1)] backdrop-blur-xl">
          <div className="bg-[#3b342d] px-7 py-10 text-[#f8f4ef] sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d8b893]">
              Organizer
            </p>

            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Create a new event
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#cfc5bb]">
              Add the details of your event and publish it to EventHub.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7 p-7 sm:p-10"
          >
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="Event title"
                value={title}
                onChange={setTitle}
                placeholder="Kerala Tech Summit"
              />

              <Field
                label="Category"
                value={category}
                onChange={setCategory}
                placeholder="Technology"
              />

              <Field
                label="Venue name"
                value={venueName}
                onChange={setVenueName}
                placeholder="Convention Centre"
              />

              <Field
                label="City"
                value={city}
                onChange={setCity}
                placeholder="Kannur"
              />

              <Field
                label="Date"
                type="date"
                value={date}
                onChange={setDate}
              />

              <Field
                label="Capacity"
                type="number"
                value={capacity}
                onChange={setCapacity}
                placeholder="100"
              />

              <Field
                label="Ticket price"
                type="number"
                value={price}
                onChange={setPrice}
                placeholder="499"
              />

              <Field
                label="Tags"
                value={tags}
                onChange={setTags}
                placeholder="tech, meetup, developer"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#51483f]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what makes this event special..."
                rows={6}
                required
                className="w-full resize-none rounded-2xl border border-[#d8cec3] bg-[#faf8f5] px-4 py-3 text-sm outline-none transition focus:border-[#9a7b5b] focus:ring-4 focus:ring-[#b49a7d]/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#3b342d] py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-[#51473e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Publishing event..." : "Publish Event →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#51483f]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-12 w-full rounded-xl border border-[#d8cec3] bg-[#faf8f5] px-4 text-sm outline-none transition focus:border-[#9a7b5b] focus:ring-4 focus:ring-[#b49a7d]/15"
      />
    </div>
  );
}
