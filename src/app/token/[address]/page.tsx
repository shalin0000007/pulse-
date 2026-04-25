"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  momentumToLabel,
  momentumToColor,
  formatChange,
  formatPrice,
  formatVolume,
} from "@/lib/momentum";

interface TokenDetail {
  address: string;
  symbol: string;
  name: string;
  description: string;
  image: string;
  twitter: string;
  website: string;
  status: string;
  price: number;
  priceUsd: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  holders: number;
  tradeCount24h: number;
  momentum: number;
  poolKey: string;
}

export default function TokenDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const [token, setToken] = useState<TokenDetail | null>(null);
  const [brief, setBrief] = useState<string>("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/token/${address}`)
      .then((r) => r.json())
      .then((data) => {
        setToken(data.token || null);
        setLoading(false);
        // Auto-fetch AI brief
        if (data.token) {
          fetchBrief(data.token);
        }
      })
      .catch(() => setLoading(false));
  }, [address]);

  const fetchBrief = async (t: TokenDetail) => {
    setBriefLoading(true);
    try {
      const res = await fetch("/api/ai-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenAddress: t.address,
          tokenName: t.name,
          symbol: t.symbol,
          price: t.price,
          change24h: t.change24h,
          volume24h: t.volume24h,
          momentum: t.momentum,
        }),
      });
      const data = await res.json();
      setBrief(data.brief || "");
    } catch {
      setBrief("AI briefing unavailable.");
    } finally {
      setBriefLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <div className="skeleton h-64 rounded-xl mb-4" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-lg font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Token not found
        </p>
        <a href="/" className="text-sm mt-2 inline-block" style={{ color: "var(--color-accent)" }}>
          ← Back to Heatmap
        </a>
      </div>
    );
  }

  const isPositive = token.change24h >= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-4">
        <a href="/" className="text-xs font-medium hover:underline" style={{ color: "var(--color-accent)" }}>
          ← Back to Heatmap
        </a>
      </div>

      {/* Token Header Card */}
      <div className="glass-card p-6 mb-4">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            {token.image && (
              <img
                src={token.image}
                alt={token.symbol}
                className="w-14 h-14 rounded-full border-2"
                style={{ borderColor: "var(--color-border-strong)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                {token.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  ${token.symbol}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: momentumToColor(token.momentum),
                    color: "#ffffff",
                  }}
                >
                  {momentumToLabel(token.momentum)}
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-bg-secondary)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {token.status}
                </span>
              </div>
            </div>
          </div>

          {/* Price + Change */}
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {token.price > 0 ? `${formatPrice(token.price)} SOL` : "—"}
            </div>
            {token.priceUsd > 0 && (
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                ${token.priceUsd.toFixed(6)}
              </div>
            )}
            <div
              className="text-lg font-bold mt-1"
              style={{ color: isPositive ? "#34D399" : "#F87171" }}
            >
              {token.price > 0 ? formatChange(token.change24h) : "—"}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Market Cap" value={token.marketCap > 0 ? `$${formatVolume(token.marketCap)}` : "—"} />
          <StatBox label="24h Volume" value={token.volume24h > 0 ? `$${formatVolume(token.volume24h)}` : "—"} />
          <StatBox label="Trades (24h)" value={token.tradeCount24h > 0 ? token.tradeCount24h.toLocaleString() : "—"} />
          <StatBox
            label="Momentum"
            value={token.momentum.toFixed(3)}
            valueColor={momentumToColor(token.momentum)}
          />
        </div>
      </div>

      {/* Description */}
      {token.description && (
        <div className="glass-card p-5 mb-4">
          <h2 className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
            ABOUT
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {token.description}
          </p>
        </div>
      )}

      {/* AI Brief */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🤖</span>
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>
            AI Market Brief
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: "#8B5CF6", color: "#ffffff" }}
          >
            Gemini
          </span>
        </div>
        {briefLoading ? (
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-4 w-3/5 rounded" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {brief || "Brief not available."}
          </p>
        )}
      </div>

      {/* Links */}
      <div className="glass-card p-5 mb-4">
        <h2 className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-muted)" }}>
          LINKS
        </h2>
        <div className="flex flex-wrap gap-2">
          <LinkPill href={`https://bags.fm`} label="🛍️ Bags" />
          <LinkPill href={`https://solscan.io/token/${token.address}`} label="🔍 Solscan" />
          <LinkPill href={`https://dexscreener.com/solana/${token.address}`} label="📊 DexScreener" />
          {token.twitter && <LinkPill href={token.twitter} label="𝕏 Twitter" />}
          {token.website && <LinkPill href={token.website} label="🌐 Website" />}
        </div>
      </div>

      {/* Contract Address */}
      <div className="glass-card p-5">
        <h2 className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
          CONTRACT ADDRESS
        </h2>
        <div
          className="text-xs font-mono break-all select-all rounded-lg p-3"
          style={{
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-secondary)",
          }}
        >
          {token.address}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--color-bg-secondary)" }}>
      <p className="text-[10px] font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: valueColor || "var(--color-text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

function LinkPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
      style={{
        background: "var(--color-bg-secondary)",
        color: "var(--color-text-primary)",
        border: "0.5px solid var(--color-border)",
      }}
    >
      {label}
    </a>
  );
}
