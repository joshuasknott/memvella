"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { Plus, Search, ArrowRight } from "lucide-react";
import { api } from "@memvella/backend";
import { MemoryCard } from "@/components/MemoryCard";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function MemoriesPage() {
  const { profile, isAuthenticated, seniorDisplayName } = useCircleProfile();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);
  const {
    results: memories,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.memories.browseMemoryRecords,
    isAuthenticated && profile ? { search: searchQuery } : "skip",
    { initialNumItems: 24 },
  );
  const isLoading =
    status === "LoadingFirstPage" || search.trim() !== searchQuery;
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
      {memories.length > 0 || search || searchQuery ? (
        <div className="search-field">
          <Search size={20} aria-hidden="true" />
          <input
            aria-label="Search memories"
            placeholder="Find a memory…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            maxLength={200}
            aria-controls="memory-list"
          />
          <span role="status">
            {isLoading
              ? "Searching…"
              : `${memories.length} ${memories.length === 1 ? "memory" : "memories"}${status !== "Exhausted" ? " shown" : ""}`}
          </span>
        </div>
      ) : null}
      {isLoading ? (
        <p role="status" className="loading-message">
          {searchQuery || search ? "Searching memories…" : "Loading memories…"}
        </p>
      ) : memories.length === 0 && !searchQuery ? (
        <div className="empty-state">
          <h2>Every memory starts somewhere.</h2>
          <p>A favourite photo or a few words is all it takes.</p>
          <Link href="/circle/add-memory" className="quiet-link">
            Add the first memory <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      ) : memories.length === 0 ? (
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
        <div id="memory-list" className="memory-grid" data-testid="memory-list">
          {memories.map((record) => (
            <MemoryCard key={record.id} record={record} />
          ))}
        </div>
      )}
      {!isLoading && status !== "Exhausted" ? (
        <div className="memory-load-more">
          <button
            type="button"
            className="action-button"
            disabled={status === "LoadingMore"}
            onClick={() => loadMore(24)}
            aria-controls="memory-list"
          >
            {status === "LoadingMore"
              ? "Loading memories…"
              : "Load more memories"}
          </button>
          <p role="status" className="editor-help">
            {status === "LoadingMore"
              ? "Loading more memories…"
              : `${memories.length} memories shown`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
