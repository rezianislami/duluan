"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/session";
import { JoinForm } from "@/components/JoinForm";

export default function JoinPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    // Validate token with server — clears stale localStorage from a previous game/kick
    fetch('/api/me', { headers: { Authorization: `Bearer ${session.sessionToken}` } })
      .then((res) => {
        if (res.ok) router.replace('/game');
        else clearSession(); // token expired or player was kicked — stay on join page
      })
      .catch(() => {
        router.replace('/game'); // network error — let the game page decide
      });
  }, [router]);

  return (
    <main
      className="flex flex-col min-h-dvh"
      style={{ background: "var(--canvas)", padding: "24px" }}
    >
      {/* Centered card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full flex flex-col" style={{ maxWidth: 360, gap: 40 }}>

          {/* Wordmark */}
          <div className="text-center select-none" style={{ gap: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1
              className="font-display font-black tracking-tight leading-none"
              style={{ fontSize: "clamp(3.5rem, 20vw, 5.5rem)", color: "var(--accent)" }}
            >
              DULUAN
            </h1>
            <p
              className="font-semibold tracking-widest uppercase"
              style={{ fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "0.2em" }}
            >
              Siapa duluan, dia menang
            </p>
          </div>

          {/* Join form */}
          <JoinForm />

          {/* Footer hint */}
          <p
            className="text-center"
            style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
          >
            Buka di HP masing-masing · Tidak perlu install
          </p>
        </div>
      </div>
    </main>
  );
}
