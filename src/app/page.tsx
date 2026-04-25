"use client";

import { useEffect, useState, useCallback } from "react";
import type { BagsToken } from "@/types/token";
import {
  momentumToBgClass,
  momentumToLabel,
  formatChange,
  formatPrice,
  formatVolume,
} from "@/lib/momentum";

export default function HomePage() {
  const [tokens, setTokens] = useState<BagsToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [sortBy, setSortBy] = useState("momentum");
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch(`/api/tokens?sort=${sortBy}&limit=200`);
      const data = await res.json();
      setTokens(data.tokens || []);
      setLastRefresh(new Date());
      setSecondsAgo(0);
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // Initial load + auto-refresh every 30s
  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 30_000);
    return () => clearInterval(interval);
  }, [fetchTokens]);

  // Seconds counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefresh.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefresh]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Section */}
      <div className="mb-6 animate-fade-in">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Live Token Heatmap
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Real-time momentum of all Bags creator tokens. Teal = bullish, Coral = bearish.
        </p>
      </div>

      {/* Controls Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 mb-4 px-4 py-3 rounded-xl"
        style={{
          background: "var(--color-bg-secondary)",
          border: "0.5px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              {secondsAgo}s ago
            </span>
          </div>

          {/* Token count */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: "var(--color-accent)",
              color: "#ffffff",
            }}
          >
            {tokens.length} tokens
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1">
          {["momentum", "volume", "change24h", "holders"].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              style={{
                background:
                  sortBy === s ? "var(--color-accent)" : "transparent",
                color:
                  sortBy === s ? "#ffffff" : "var(--color-text-secondary)",
              }}
            >
              {s === "change24h" ? "24h %" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Momentum Legend */}
      <div
        className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs"
        style={{
          background: "var(--color-bg-secondary)",
          border: "0.5px solid var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        <span>Strong Sell</span>
        <div className="flex gap-0.5">
          <div className="w-5 h-3 rounded-sm bg-orange-800" />
          <div className="w-5 h-3 rounded-sm bg-orange-600" />
          <div className="w-5 h-3 rounded-sm bg-zinc-700" />
          <div className="w-5 h-3 rounded-sm bg-teal-400/40" />
          <div className="w-5 h-3 rounded-sm bg-teal-600" />
          <div className="w-5 h-3 rounded-sm bg-teal-800" />
        </div>
        <span>Strong Buy</span>
      </div>

      {/* Heatmap Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl"
          style={{ background: "var(--color-bg-secondary)" }}
        >
          <p className="text-lg font-medium" style={{ color: "var(--color-text-secondary)" }}>
            No tokens found
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Check that your Bags API key is configured correctly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {tokens.map((token) => (
            <TokenCell key={token.address} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}

function TokenCell({ token }: { token: BagsToken }) {
  const isPositive = token.change24h >= 0;

  return (
    <a
      href={`/token/${token.address}`}
      className={`momentum-cell rounded-xl p-3 flex flex-col justify-between cursor-pointer ${momentumToBgClass(token.momentum)}`}
      style={{
        minHeight: "96px",
        border: "0.5px solid var(--color-border)",
      }}
      title={`${token.name} — ${momentumToLabel(token.momentum)}`}
    >
      {/* Top: Symbol + Image */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white truncate">
          {token.symbol}
        </span>
        {token.image && (
          <img
            src={token.image}
            alt={token.symbol}
            className="w-5 h-5 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>

      {/* Bottom: Price + Change */}
      <div>
        <div className="text-[11px] font-medium text-white/80">
          {token.price > 0 ? `${formatPrice(token.price)} SOL` : "—"}
        </div>
        <div
          className="text-sm font-bold"
          style={{
            color: isPositive ? "#34D399" : "#F87171",
          }}
        >
          {token.price > 0 ? formatChange(token.change24h) : "—"}
        </div>
      </div>

      {/* Volume tag */}
      {token.volume24h > 0 && (
        <div className="text-[9px] font-medium text-white/50 mt-0.5">
          Vol: ${formatVolume(token.volume24h)}
        </div>
      )}
    </a>
  );
}
