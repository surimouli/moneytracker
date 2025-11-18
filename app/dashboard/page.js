"use client";

import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
  UserButton,
} from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();

  const fakeTotal = 125.4; // temporary until backend exists

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: "#FFB3C6",
                  letterSpacing: "-0.03em",
                }}
              >
                Your Money, Your Story
              </h1>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#D7C2C0",
                  marginTop: "0.15rem",
                }}
              >
                Signed in as{" "}
                <span style={{ fontWeight: 600 }}>
                  {user?.primaryEmailAddress?.emailAddress ||
                    user?.username ||
                    user?.id}
                </span>
              </p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    borderRadius: "999px",
                  },
                },
              }}
            />
          </header>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.3fr)",
              gap: "1.4rem",
            }}
          >
            <div
              style={{
                borderRadius: "1.1rem",
                padding: "1.3rem",
                border: "1px solid #3B2520",
                background:
                  "linear-gradient(145deg, rgba(36,23,23,0.96), rgba(53,32,28,0.96))",
                boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#FFB3C6",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                }}
              >
                Net balance (demo)
              </p>
              <p
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  color: fakeTotal >= 0 ? "#FFB3C6" : "#FF8FAB",
                }}
              >
                ${fakeTotal.toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#D7C2C0",
                  marginTop: "0.4rem",
                }}
              >
                This number will be powered by your real transactions once we hook up the
                Python backend.
              </p>
            </div>

            <div
              style={{
                borderRadius: "1.1rem",
                padding: "1.1rem",
                border: "1px solid #3B2520",
                backgroundColor: "#241717",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#FFB3C6",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                }}
              >
                What&apos;s coming next
              </p>
              <ul
                style={{
                  paddingLeft: "1.1rem",
                  color: "#D7C2C0",
                  fontSize: "0.86rem",
                  marginTop: "0.2rem",
                }}
              >
                <li>Python FastAPI backend</li>
                <li>Real database (SQLite/Postgres)</li>
                <li>Add income & expense entries</li>
                <li>History of all your transactions</li>
              </ul>
            </div>
          </section>

          <section
            style={{
              borderRadius: "1.1rem",
              padding: "1.2rem",
              border: "1px solid #3B2520",
              backgroundColor: "#241717",
            }}
          >
            <p
              style={{
                fontSize: "0.9rem",
                color: "#FFB3C6",
                fontWeight: 600,
                marginBottom: "0.3rem",
              }}
            >
              Dashboard status
            </p>
            <p style={{ fontSize: "0.88rem", color: "#D7C2C0" }}>
              ✅ Auth is working with Clerk.
              <br />
              🧱 Next up: connect this to a FastAPI backend so this page shows your
              actual data instead of placeholders.
            </p>
          </section>
        </div>
      </SignedIn>
    </>
  );
}