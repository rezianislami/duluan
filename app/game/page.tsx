"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/session";
import { useGameState } from "@/hooks/useGameState";
import { BellButton } from "@/components/BellButton";
import { BellStatusLabel } from "@/components/BellStatusLabel";
import { Leaderboard } from "@/components/Leaderboard";
import { Confetti } from "@/components/Confetti";
import type { SessionData } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = { lobby: "Lobby", active: "Live", ended: "Selesai" };

export default function GamePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const leaderboardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }

    // Validate token server-side — catches stale tokens after kick or full DB reset
    fetch('/api/me', { headers: { Authorization: `Bearer ${s.sessionToken}` } })
      .then((res) => {
        if (!res.ok) { clearSession(); router.replace("/"); return; }
        setSession(s);
        setSessionChecked(true);
      })
      .catch(() => {
        // Network error — allow through so the game page can show the SSE state
        setSession(s);
        setSessionChecked(true);
      });
  }, [router]);

  const { gameState, players, myPlayer, bellState, isLoading } = useGameState(session);

  // Auto-scroll to leaderboard when game ends
  useEffect(() => {
    if (gameState.status === "ended") {
      leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [gameState.status]);

  // Auto-kick: if SSE has loaded and our player no longer exists, session was invalidated
  // (factory reset or kicked). Clear localStorage and send back to join.
  useEffect(() => {
    if (!sessionChecked || isLoading || !session) return;
    if (myPlayer === null) {
      clearSession();
      router.replace('/');
    }
  }, [sessionChecked, isLoading, session, myPlayer, router]);

  const handleBuzz = useCallback(async () => {
    if (!session) return;
    await fetch('/api/buzz', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.sessionToken}` },
    });
  }, [session]);

  if (!sessionChecked || isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center" style={{ background: "var(--canvas)" }}>
        <span style={{ color: "var(--text-muted)" }}>Memuat…</span>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-dvh" style={{ background: "var(--canvas)" }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span
            className="font-display font-black tracking-tight leading-none"
            style={{ color: "var(--accent)", fontSize: "1.25rem" }}
          >
            DULUAN
          </span>
          {gameState.status !== "active" && (
            <span
              className="font-bold tracking-widest uppercase"
              style={{
                fontSize: "0.6rem",
                color: gameState.status === "ended" ? "var(--danger)" : "var(--text-muted)",
              }}
            >
              {STATUS_LABELS[gameState.status]}
            </span>
          )}
        </div>

        <div className="flex items-center" style={{ gap: 12 }}>
          <span
            className="font-bold truncate"
            style={{ color: "var(--text-primary)", fontSize: "1rem", maxWidth: 160 }}
          >
            {session?.playerName ?? "—"}
          </span>
          <span
            className="font-display font-black tabular-nums"
            style={{
              color: "var(--accent)",
              fontSize: "0.95rem",
              padding: "2px 10px",
              background: "var(--accent-dim)",
              borderRadius: 8,
            }}
          >
            {myPlayer?.score ?? 0}
            <span
              className="font-sans font-normal"
              style={{ color: "var(--text-secondary)", fontSize: "0.7rem", marginLeft: 3 }}
            >
              pts
            </span>
          </span>
        </div>
      </header>

      {/* ── Bell area — hidden when game is over ── */}
      {gameState.status !== "ended" && (
        <section
          className="flex flex-1 flex-col items-center justify-center"
          style={{ gap: 32, padding: "32px 24px", minHeight: "55vh" }}
        >
          <BellStatusLabel
            state={bellState}
            winnerName={gameState.currentBuzzerName}
          />

          <BellButton state={bellState} onBuzz={handleBuzz} />

          <p
            className="font-semibold tracking-widest uppercase text-center"
            style={{ color: "var(--text-muted)", fontSize: "0.65rem", minHeight: 16 }}
          >
            {bellState === "armed"
              ? "Secepat mungkin!"
              : bellState === "disarmed"
              ? "Menunggu Game Master…"
              : null}
          </p>
        </section>
      )}

      {/* ── Divider — hidden when game is over ── */}
      {gameState.status !== "ended" && (
        <div style={{ height: 1, background: "var(--border)", margin: "0 24px" }} />
      )}

      {/* ── Leaderboard — fills remaining space when game is over ── */}
      <section
        ref={leaderboardRef}
        className="overflow-y-auto"
        style={{
          padding: "24px",
          flex: gameState.status === "ended" ? 1 : undefined,
          maxHeight: gameState.status === "ended" ? undefined : "40vh",
        }}
      >
        <Leaderboard players={players} myPlayerId={session?.playerId} gameStatus={gameState.status} />
      </section>

      {/* Confetti — fires once when game ends, for all players */}
      <Confetti active={gameState.status === "ended"} />
    </main>
  );
}
