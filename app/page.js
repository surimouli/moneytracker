import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <h1
          style={{
            fontSize: "2.4rem",
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#FFB3C6",
            textShadow: "0 8px 25px rgba(0,0,0,0.55)",
          }}
        >
          MoneyTracker
        </h1>
        <p
          style={{
            fontSize: "1.05rem",
            color: "#D7C2C0",
            maxWidth: "34rem",
          }}
        >
          A cozy little place to keep an eye on your money. Track your income and
          expenses in a way that actually feels nice to look at.
        </p>

        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <SignedOut>
            <Link
              href="/sign-up"
              style={{
                background: "linear-gradient(135deg, #FF8FAB, #FFB3C6)",
                color: "#3B2520",
                padding: "0.65rem 1.4rem",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(255,143,171,0.3)",
              }}
            >
              Create your account
            </Link>
            <Link
              href="/sign-in"
              style={{
                borderRadius: "999px",
                padding: "0.6rem 1.3rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                border: "1px solid #4E342E",
                color: "#FFEDEE",
                textDecoration: "none",
                backgroundColor: "rgba(36,23,23,0.9)",
              }}
            >
              I already have one
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              style={{
                background: "linear-gradient(135deg, #FF8FAB, #FFB3C6)",
                color: "#3B2520",
                padding: "0.65rem 1.4rem",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(255,143,171,0.3)",
              }}
            >
              Go to your dashboard
            </Link>
          </SignedIn>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.2rem",
        }}
      >
        <div
          style={{
            borderRadius: "1rem",
            padding: "1rem",
            border: "1px solid #3B2520",
            background:
              "linear-gradient(145deg, rgba(36,23,23,0.96), rgba(53,32,28,0.96))",
            boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
          }}
        >
          <p style={{ fontSize: "0.9rem", color: "#FFB3C6", fontWeight: 600 }}>
            ✨ Simple, on purpose
          </p>
          <p style={{ fontSize: "0.9rem", color: "#D7C2C0", marginTop: "0.4rem" }}>
            No charts yelling at you. Just a clean list of what you spent and what you made.
          </p>
        </div>

        <div
          style={{
            borderRadius: "1rem",
            padding: "1rem",
            border: "1px solid #3B2520",
            backgroundColor: "#241717",
          }}
        >
          <p style={{ fontSize: "0.9rem", color: "#FFB3C6", fontWeight: 600 }}>
            🔐 Safe & personal
          </p>
          <p style={{ fontSize: "0.9rem", color: "#D7C2C0", marginTop: "0.4rem" }}>
            Your data lives behind your Clerk account, instead of just sitting in local
            storage waiting to disappear.
          </p>
        </div>

        <div
          style={{
            borderRadius: "1rem",
            padding: "1rem",
            border: "1px solid #3B2520",
            backgroundColor: "#241717",
          }}
        >
          <p style={{ fontSize: "0.9rem", color: "#FFB3C6", fontWeight: 600 }}>
            ☕ Built for real life
          </p>
          <p style={{ fontSize: "0.9rem", color: "#D7C2C0", marginTop: "0.4rem" }}>
            Add a transaction in a few seconds, then get back to your day. No overwhelm,
            just awareness.
          </p>
        </div>
      </section>
    </div>
  );
}