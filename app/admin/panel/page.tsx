"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useGmGameState } from "@/hooks/useGmGameState";
import { BellControl } from "@/components/admin/BellControl";
import { GmPlayerList } from "@/components/admin/GmPlayerList";
import { RankBadge } from "@/components/RankBadge";

const STATUS_COLORS: Record<string, string> = {
  lobby: "var(--text-secondary)",
  active: "var(--success)",
  ended: "var(--danger)",
};
const STATUS_LABELS: Record<string, string> = {
  lobby: "Lobby",
  active: "● Live",
  ended: "Selesai",
};

export default function GmPanelPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [confirmReset, setConfirmReset] = useState(false);
  const [endGameStep, setEndGameStep] = useState<"idle" | "tie" | "confirm">("idle");
  const [tiedNames, setTiedNames] = useState<string[]>([]);
  const [confirmFactory, setConfirmFactory] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.replace("/admin");
  }, [session, isPending, router]);

  const { gameState, players, actions } = useGmGameState();

  // GM owns the answer timer: serverless has no background jobs, and the GM panel is
  // the one always-connected client. When the countdown reaches zero, fire the timeout
  // (auto-wrong). The server call is conditional on buzzerId, so a late/duplicate fire
  // after the GM already judged simply no-ops.
  useEffect(() => {
    const { currentBuzzerId, buzzerExpiresAt } = gameState;
    if (!currentBuzzerId || !buzzerExpiresAt) return;
    const ms = new Date(buzzerExpiresAt).getTime() - Date.now();
    const id = setTimeout(() => actions.timeoutBuzzer(currentBuzzerId), Math.max(0, ms));
    return () => clearTimeout(id);
    // actions.timeoutBuzzer is stable (useCallback []); depend only on the active buzzer + deadline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentBuzzerId, gameState.buzzerExpiresAt]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/admin");
  };

  const handleEndGameClick = () => {
    const topScore = sortedPlayers[0]?.score ?? 0;
    const tied = topScore > 0 ? sortedPlayers.filter((p) => p.score === topScore) : [];
    if (tied.length > 1) {
      setTiedNames(tied.map((p) => p.name));
      setEndGameStep("tie");
    } else {
      setEndGameStep("confirm");
    }
  };

  const handleEndGame = async () => {
    await actions.endGame();
    setEndGameStep("idle");
    setTiedNames([]);
  };

  const handleReset = async () => {
    await actions.resetGame();
    setConfirmReset(false);
    setEndGameStep("idle");
    setTiedNames([]);
  };

  const handleFactoryReset = async () => {
    await actions.factoryReset();
    setConfirmFactory(false);
    setConfirmReset(false);
    setEndGameStep("idle");
    setTiedNames([]);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  if (isPending || !session) {
    return (
      <main className="flex min-h-dvh items-center justify-center" style={{ background: "var(--canvas)" }}>
        <span style={{ color: "var(--text-muted)" }}>Memeriksa akses…</span>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: "var(--canvas)" }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{ padding: "16px 32px", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center" style={{ gap: 12 }}>
          <span
            className="font-display font-black tracking-tight"
            style={{ color: "var(--accent)", fontSize: "1.25rem" }}
          >
            DULUAN
          </span>
          <span
            className="font-bold uppercase tracking-widest"
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              fontSize: "0.6rem",
              background: "var(--elevated)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            GM
          </span>
          <span
            className="font-bold tracking-widest uppercase"
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              fontSize: "0.65rem",
              color: STATUS_COLORS[gameState.status] ?? "var(--text-secondary)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {STATUS_LABELS[gameState.status] ?? gameState.status}
          </span>
        </div>

        <div className="flex items-center" style={{ gap: 8 }}>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Keluar
          </button>
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <div
        className="flex-1 overflow-hidden"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px" }}
      >
        {/* ── Left: control + players ── */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ padding: "32px", gap: 32, borderRight: "1px solid var(--border)" }}
        >
            <BellControl gameState={gameState} players={players} actions={actions} />

            <div style={{ height: 1, background: "var(--border)" }} />

            <GmPlayerList
              players={players}
              currentBuzzerId={gameState.currentBuzzerId}
              actions={actions}
            />

            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Danger zone */}
            <div className="flex flex-col" style={{ gap: 20 }}>
              <p className="section-label">Akhiri Sesi</p>

              {/* ── Action 1: End game (status → ended, scores preserved) ── */}
              {endGameStep === "idle" ? (
                <button
                  onClick={handleEndGameClick}
                  disabled={gameState.status === "ended"}
                  className="btn btn-outline-danger btn-md btn-full"
                >
                  Akhiri Game
                </button>
              ) : endGameStep === "tie" ? (
                <div
                  className="rounded-lg flex flex-col"
                  style={{ padding: "20px", gap: 16, background: "rgba(239,68,68,0.07)", border: "1px solid var(--danger)" }}
                >
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <p className="font-bold" style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      Skor Seri!
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {tiedNames.join(", ")} memiliki skor tertinggi yang sama. Tetap akhiri game?
                    </p>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <button onClick={handleEndGame} className="btn btn-danger btn-md" style={{ flex: 1 }}>
                      Tetap Akhiri
                    </button>
                    <button onClick={() => setEndGameStep("idle")} className="btn btn-ghost btn-md">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-lg flex flex-col"
                  style={{ padding: "20px", gap: 16, background: "rgba(239,68,68,0.07)", border: "1px solid var(--danger)" }}
                >
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <p className="font-bold" style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      Akhiri game sekarang?
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Skor tidak direset. Layar pemain beralih ke hasil akhir.
                    </p>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <button onClick={handleEndGame} className="btn btn-danger btn-md" style={{ flex: 1 }}>
                      Ya, Akhiri Game
                    </button>
                    <button onClick={() => setEndGameStep("idle")} className="btn btn-ghost btn-md">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: "var(--border)" }} />

              {/* ── Action 2: Reset scores + return to lobby ── */}
              {confirmReset ? (
                <div
                  className="rounded-lg flex flex-col"
                  style={{ padding: "20px", gap: 16, background: "rgba(239,68,68,0.07)", border: "1px solid var(--danger)" }}
                >
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <p className="font-bold" style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      Reset semua skor dan mulai game baru?
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Semua skor dihapus, game kembali ke lobby. Tidak bisa dibatalkan.
                    </p>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <button onClick={handleReset} className="btn btn-danger btn-md" style={{ flex: 1 }}>
                      Ya, Reset Sekarang
                    </button>
                    <button onClick={() => setConfirmReset(false)} className="btn btn-ghost btn-md">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="btn btn-outline-danger btn-md btn-full"
                >
                  Reset Skor / Game Baru
                </button>
              )}
            </div>
        </div>

        {/* ── Right: points config + leaderboard ── */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ padding: "32px", gap: 28 }}
        >
          {/* Points per correct */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <p className="section-label">Poin per jawaban benar</p>
            <div
              className="flex items-center rounded-lg"
              style={{
                padding: "12px 16px",
                gap: 12,
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => actions.setPointsPerCorrect(Math.max(1, gameState.pointsPerCorrect - 1))}
                className="btn btn-ghost btn-icon"
              >
                −
              </button>
              <span
                className="font-display font-black tabular-nums flex-1 text-center"
                style={{ fontSize: "2rem", color: "var(--text-primary)" }}
              >
                {gameState.pointsPerCorrect}
              </span>
              <button
                onClick={() => actions.setPointsPerCorrect(gameState.pointsPerCorrect + 1)}
                className="btn btn-ghost btn-icon"
              >
                +
              </button>
            </div>
          </div>

          {/* Answer time limit */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <p className="section-label">Waktu jawab (detik)</p>
            <div className="grid grid-cols-4" style={{ gap: 8 }}>
              {[10, 15, 20, 30].map((s) => {
                const active = gameState.answerTimeLimit === s;
                return (
                  <button
                    key={s}
                    onClick={() => actions.setAnswerTimeLimit(s)}
                    className={`btn btn-md ${active ? "btn-accent" : "btn-ghost"}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Leaderboard */}
          <div className="flex flex-col flex-1" style={{ gap: 12 }}>
            <p className="section-label">Leaderboard Live</p>

            {sortedPlayers.length === 0 ? (
              <p className="text-center" style={{ padding: "32px 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Belum ada pemain.
              </p>
            ) : (
              <ol className="flex flex-col" style={{ gap: 8 }}>
                {sortedPlayers.map((player, idx) => (
                  <li
                    key={player.id}
                    className="flex items-center rounded-lg"
                    style={{
                      padding: "12px 16px",
                      gap: 12,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      opacity: player.eliminatedThisRound ? 0.5 : 1,
                    }}
                  >
                    <RankBadge rank={idx + 1} />
                    <span
                      className="flex-1 font-bold truncate"
                      style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}
                    >
                      {player.name}
                    </span>
                    <span
                      className="font-display font-black tabular-nums shrink-0"
                      style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}
                    >
                      {player.score}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <p
            className="text-center font-medium"
            style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}
          >
            {players.length} pemain terhubung
          </p>

          <div style={{ height: 1, background: "var(--border)" }} />

          {/* ── Reset Semua ── */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <p className="section-label">Reset Semua</p>

            {confirmFactory ? (
              <div
                className="rounded-lg flex flex-col"
                style={{ padding: "20px", gap: 16, background: "rgba(239,68,68,0.07)", border: "1px solid var(--danger)" }}
              >
                <div className="flex flex-col" style={{ gap: 4 }}>
                  <p className="font-bold" style={{ fontSize: "0.875rem", color: "var(--danger)" }}>
                    ⚠ Semua data akan dihapus permanen
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Seluruh sesi, pemain, dan skor dihapus dari database. HP pemain otomatis kembali ke halaman join.
                  </p>
                </div>
                <div className="flex" style={{ gap: 8 }}>
                  <button onClick={handleFactoryReset} className="btn btn-danger btn-md" style={{ flex: 1 }}>
                    Hapus Semua, Mulai Baru
                  </button>
                  <button onClick={() => setConfirmFactory(false)} className="btn btn-ghost btn-md">
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmFactory(true)}
                className="btn btn-outline-danger btn-md btn-full"
              >
                Reset Semua
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .flex-1.overflow-hidden { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
