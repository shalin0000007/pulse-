"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/types/user";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6 animate-fade-in">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          🏆 Social Leaderboard
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Top wallets ranked by curator score — who spots the winners early?
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--color-bg-primary)",
          border: "0.5px solid var(--color-border)",
        }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold"
          style={{
            borderBottom: "0.5px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-4">Wallet</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">Top Pick</div>
          <div className="col-span-3 text-right">7d Perf</div>
        </div>

        {/* Rows */}
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <div className="skeleton h-6 rounded" />
              </div>
            ))
          : entries.map((entry) => (
              <div
                key={entry.rank}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:opacity-80 cursor-pointer animate-fade-in"
                style={{
                  borderBottom: "0.5px solid var(--color-border)",
                }}
              >
                <div className="col-span-1">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        entry.rank <= 3
                          ? "var(--color-accent)"
                          : "var(--color-text-muted)",
                    }}
                  >
                    {entry.rank <= 3
                      ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                      : entry.rank}
                  </span>
                </div>
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "var(--color-bg-secondary)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {entry.walletAddress.slice(0, 2)}
                    </div>
                    <span
                      className="text-sm font-mono truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {entry.walletAddress.slice(0, 4)}...
                      {entry.walletAddress.slice(-4)}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {entry.curatorScore.toFixed(1)}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      background: "var(--color-bg-secondary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    ${entry.topPick}
                  </span>
                </div>
                <div className="col-span-3 text-right">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        entry.weekPerformance >= 0 ? "#34D399" : "#F87171",
                    }}
                  >
                    {entry.weekPerformance >= 0 ? "+" : ""}
                    {(entry.weekPerformance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
