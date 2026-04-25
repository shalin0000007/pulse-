"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const params = useParams();
  const wallet = params.wallet as string;
  const [feeData, setFeeData] = useState<{
    totalEarned: number;
    positionCount: number;
  } | null>(null);

  useEffect(() => {
    if (!wallet) return;
    fetch(`/api/fee-share?wallet=${wallet}`)
      .then((r) => r.json())
      .then(setFeeData)
      .catch(() => {});
  }, [wallet]);

  const shortWallet = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-4">
        <a href="/" className="text-xs font-medium hover:underline" style={{ color: "var(--color-accent)" }}>
          ← Back to Heatmap
        </a>
      </div>

      {/* Profile Header */}
      <div className="glass-card p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              background: "linear-gradient(135deg, var(--color-accent), var(--color-purple))",
              color: "#ffffff",
            }}
          >
            {shortWallet.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {shortWallet}
            </h1>
            <div
              className="text-xs font-mono mt-1 select-all"
              style={{ color: "var(--color-text-muted)" }}
            >
              {wallet}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ProfileStat label="Curator Score" value="—" />
          <ProfileStat label="Fee Earnings" value={feeData ? `${feeData.totalEarned.toFixed(4)} SOL` : "—"} />
          <ProfileStat label="Fee Positions" value={feeData ? `${feeData.positionCount}` : "—"} />
          <ProfileStat label="Squads" value="—" />
        </div>
      </div>

      {/* Links */}
      <div className="glass-card p-5 mb-4">
        <h2 className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-muted)" }}>
          EXPLORER
        </h2>
        <div className="flex gap-2">
          <a
            href={`https://solscan.io/account/${wallet}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80"
            style={{
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              border: "0.5px solid var(--color-border)",
            }}
          >
            🔍 Solscan
          </a>
          <a
            href={`https://bags.fm`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80"
            style={{
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              border: "0.5px solid var(--color-border)",
            }}
          >
            🛍️ Bags Profile
          </a>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="glass-card p-6 text-center">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Full profile with holdings, trade history, and badge collection coming in Week 2.
        </p>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--color-bg-secondary)" }}>
      <p className="text-[10px] font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
