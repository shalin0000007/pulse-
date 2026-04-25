export default function SquadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6 animate-fade-in">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          👥 Squad Portfolios
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Team up with friends. See your combined holdings and shared picks.
        </p>
      </div>

      {/* Create Squad Card */}
      <div
        className="glass-card p-6 mb-6 text-center animate-slide-up"
      >
        <div className="text-4xl mb-3">🚀</div>
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Create Your First Squad
        </h2>
        <p
          className="text-sm mb-4 max-w-md mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Squad Portfolios let you combine wallets with your friends.
          See what tokens you all agree on — the collective alpha.
        </p>
        <button
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: "var(--color-accent)",
            color: "#ffffff",
          }}
        >
          Connect Wallet to Create
        </button>
      </div>

      {/* How It Works */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          {
            icon: "1️⃣",
            title: "Create & Name",
            desc: "Give your squad a name. You get a shareable invite link.",
          },
          {
            icon: "2️⃣",
            title: "Invite Friends",
            desc: "Share the link. Up to 10 wallets per squad.",
          },
          {
            icon: "3️⃣",
            title: "See Shared Alpha",
            desc: "View combined holdings, shared picks, and squad rank.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="glass-card p-4 animate-fade-in"
          >
            <div className="text-2xl mb-2">{step.icon}</div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {step.title}
            </h3>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
