"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f7f7f5",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "32px",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 600,
              color: "#666",
              letterSpacing: "0.04em",
            }}
          >
            TEACHING HUB
          </p>

          <h1
            style={{
              margin: "8px 0 8px",
              fontSize: "28px",
              lineHeight: 1.2,
            }}
          >
            Welcome back
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px",
            }}
          >
            Sign in to continue to your teaching workspace.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          <label style={{ display: "grid", gap: "7px" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                border: "1px solid #d9d9d9",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "7px" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                border: "1px solid #d9d9d9",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />
          </label>

          {error && (
            <p
              style={{
                margin: 0,
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#fff1f1",
                color: "#b42318",
                fontSize: "13px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "4px",
              padding: "12px 16px",
              border: "none",
              borderRadius: "10px",
              background: "#111111",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}