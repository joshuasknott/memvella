"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Plus, Search, ArrowRight } from "lucide-react";
import { api } from "@memvella/backend";
import { MemoryCard } from "@/components/MemoryCard";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function MemoriesPage() {
  const { profile, isAuthenticated, seniorDisplayName } = useCircleProfile();
  const memories = useQuery(
    api.memories.listMemoryRecords,
    isAuthenticated && profile ? {} : "skip",
  );
  const [search, setSearch] = useState("");
  const filtered = memories?.filter((record) =>
    `${record.title} ${record.summary}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">The moments that stay</p>
          <h1>Memories</h1>
          <p>Familiar stories, photos, and voices for {seniorDisplayName}.</p>
        </div>
        <Link href="/circle/add-memory" className="action-button">
          <Plus size={20} aria-hidden="true" /> Add a memory
        </Link>
      </section>
      {memories && memories.length > 0 ? (
        <div className="search-field">
          <Search size={20} aria-hidden="true" />
          <input
            aria-label="Search memories"
            placeholder="Find a memory…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
          />
          <span aria-live="polite">{filtered?.length} memories</span>
        </div>
      ) : null}
      {memories === undefined ? (
        <p role="status" className="loading-message">
          Loading memories…
        </p>
      ) : memories.length === 0 ? (
        <div className="empty-state">
          <h2>Every memory starts somewhere.</h2>
          <p>A favourite photo or a few words is all it takes.</p>
          <Link href="/circle/add-memory" className="quiet-link">
            Add the first memory <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : filtered?.length === 0 ? (
        <div className="empty-state">
          <h2>No matching memories</h2>
          <p>Try another word, or clear your search.</p>
          <button
            type="button"
            className="quiet-link"
            onClick={() => setSearch("")}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="memory-grid" data-testid="memory-list">
          {filtered?.map((record) => (
            <MemoryCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
