"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PasscodeForm } from "@/components/admin/PasscodeForm";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) router.replace("/admin/panel");
  }, [session, isPending, router]);

  return (
    <main
      className="flex flex-col min-h-dvh"
      style={{ background: "var(--canvas)", padding: "24px" }}
    >
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full flex flex-col" style={{ maxWidth: 360, gap: 40 }}>

          {/* Icon + title */}
          <div className="text-center select-none flex flex-col items-center" style={{ gap: 16 }}>
            <div
              className="rounded-xl flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                background: "var(--surface)",
                border: "2px solid var(--border)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div className="flex flex-col items-center" style={{ gap: 4 }}>
              <h1
                className="font-display font-black"
                style={{ fontSize: "2rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                GM Panel
              </h1>
              <p
                className="font-semibold tracking-widest uppercase"
                style={{ fontSize: "0.65rem", color: "var(--text-secondary)", letterSpacing: "0.2em" }}
              >
                DULUAN · Game Master
              </p>
            </div>
          </div>

          <PasscodeForm />

          <p className="text-center" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Bukan GM?{" "}
            <a
              href="/"
              style={{ color: "var(--text-secondary)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Gabung sebagai pemain
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
