import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="demo-page rise-in">
      <div className="mx-auto max-w-3xl text-center">
        <p className="island-kicker mb-3">AI-Powered Refund Evaluation</p>
        <h1 className="demo-title display-title mb-4">
          WORKNOON Refund System
        </h1>
        <p className="demo-muted mx-auto mb-10 max-w-lg text-lg leading-relaxed">
          Automated refund processing powered by AI. Submit refund requests and
          receive instant decisions based on order history, policy rules, and
          intelligent analysis.
        </p>

        <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2">
          <Link to="/request" className="no-underline">
            <div className="feature-card cursor-pointer rounded-2xl border border-[var(--line)] p-6 text-left transition-all">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--lagoon)_18%,transparent)]">
                <svg
                  className="h-5 w-5 text-[var(--lagoon-deep)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <h3 className="m-0 mb-1 text-base font-bold text-[var(--sea-ink)]">
                Submit Request
              </h3>
              <p className="demo-muted m-0 text-sm">
                File a new refund request and receive an AI-powered decision in
                seconds.
              </p>
            </div>
          </Link>

          <Link to="/admin" className="no-underline">
            <div className="feature-card cursor-pointer rounded-2xl border border-[var(--line)] p-6 text-left transition-all">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--palm)_18%,transparent)]">
                <svg
                  className="h-5 w-5 text-[var(--palm)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
              </div>
              <h3 className="m-0 mb-1 text-base font-bold text-[var(--sea-ink)]">
                Admin Portal
              </h3>
              <p className="demo-muted m-0 text-sm">
                Review all refund requests, filter by status, and inspect AI
                reasoning.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
