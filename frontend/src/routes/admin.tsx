import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useRefundsQuery } from "../queries/refunds";
import type { RefundRequest, RefundStatus } from "../lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type FilterStatus = "ALL" | RefundStatus;

function AdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refundsQuery = useRefundsQuery();
  const refunds = refundsQuery.data || [];

  const filtered = useMemo(() => {
    return refunds.filter((r) => {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesSearch =
        !search ||
        r.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.order?.orderNumber?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [refunds, statusFilter, search]);

  const counts = useMemo(() => {
    const c = {
      total: refunds.length,
      APPROVED: 0,
      DENIED: 0,
      ESCALATED: 0,
      PENDING: 0,
    };
    for (const r of refunds) {
      if (r.status in c) c[r.status as RefundStatus]++;
    }
    return c;
  }, [refunds]);

  const statuses: { label: string; value: FilterStatus; color: string }[] = [
    { label: "All", value: "ALL", color: "" },
    { label: "Pending", value: "PENDING", color: "text-[var(--sea-ink-soft)]" },
    { label: "Approved", value: "APPROVED", color: "text-emerald-600" },
    { label: "Denied", value: "DENIED", color: "text-red-600" },
    { label: "Escalated", value: "ESCALATED", color: "text-amber-600" },
  ];

  return (
    <div className="demo-page demo-page-wide rise-in">
      <p className="island-kicker mb-3">Administration</p>
      <h1 className="demo-title mb-8 text-2xl">Refund Dashboard</h1>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Requests"
          count={counts.total}
          color="text-[var(--sea-ink)]"
          bgClass="bg-[color-mix(in_oklab,var(--lagoon)_12%,transparent)]"
        />
        <SummaryCard
          label="Approved"
          count={counts.APPROVED}
          color="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <SummaryCard
          label="Denied"
          count={counts.DENIED}
          color="text-red-600"
          bgClass="bg-red-50"
        />
        <SummaryCard
          label="Escalated"
          count={counts.ESCALATED}
          color="text-amber-600"
          bgClass="bg-amber-50"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`demo-pill cursor-pointer transition-all ${
                statusFilter === s.value
                  ? "border-[var(--lagoon-deep)] bg-[color-mix(in_oklab,var(--lagoon)_16%,var(--chip-bg))] font-bold text-[var(--sea-ink)]"
                  : "hover:border-[var(--lagoon)]"
              } ${s.color}`}
            >
              {s.label}
              {s.value !== "ALL" && (
                <span className="ml-1 opacity-60">
                  {counts[s.value as RefundStatus]}
                </span>
              )}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="demo-input demo-input-fit min-w-[220px]"
          placeholder="Search by customer or order..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {refundsQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-[var(--line)]"
            />
          ))}
        </div>
      ) : refundsQuery.isError ? (
        <div className="demo-alert demo-alert-danger">
          <p className="m-0 text-sm font-semibold">
            Failed to load refund requests
          </p>
          <p className="demo-muted m-0 mt-1 text-sm">
            Make sure the backend is running at localhost:3001.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="demo-panel py-12 text-center">
          <p className="demo-muted m-0 text-sm">No refund requests found.</p>
        </div>
      ) : (
        <div className="demo-table-shell">
          <table className="demo-table text-sm">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Order #</th>
                <th className="hidden sm:table-cell">Amount</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Date</th>
                <th className="hidden lg:table-cell">Confidence</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <RefundRow
                  key={r.id}
                  refund={r}
                  isExpanded={expandedId === r.id}
                  onToggle={() =>
                    setExpandedId(expandedId === r.id ? null : r.id)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  color,
  bgClass,
}: {
  label: string;
  count: number;
  color: string;
  bgClass: string;
}) {
  return (
    <div className="demo-card flex items-center gap-4">
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${bgClass}`}
      >
        <span className={`text-lg font-bold ${color}`}>{count}</span>
      </div>
      <div>
        <p className="demo-muted m-0 text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}

function DecisionBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "border-emerald-300 bg-emerald-50 text-emerald-700",
    DENIED: "border-red-300 bg-red-50 text-red-700",
    ESCALATED: "border-amber-300 bg-amber-50 text-amber-700",
    PENDING:
      "border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)]",
  };

  return (
    <span className={`demo-pill ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}

function RefundRow({
  refund,
  isExpanded,
  onToggle,
}: {
  refund: RefundRequest;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="cursor-pointer" onClick={onToggle}>
        <td className="font-semibold">{refund.customer?.name || "Unknown"}</td>
        <td className="font-mono text-xs">
          {refund.order?.orderNumber || "---"}
        </td>
        <td className="hidden font-semibold sm:table-cell">
          ${Number(refund.order?.totalAmount || 0).toFixed(2)}
        </td>
        <td>
          <DecisionBadge status={refund.status} />
        </td>
        <td className="demo-muted hidden text-xs md:table-cell">
          {new Date(refund.createdAt).toLocaleDateString()}
        </td>
        <td className="hidden lg:table-cell">
          {refund.confidence !== null ? (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--line)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--lagoon),var(--lagoon-deep))]"
                  style={{
                    width: `${Math.round(refund.confidence * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-[var(--sea-ink-soft)]">
                {Math.round(refund.confidence * 100)}%
              </span>
            </div>
          ) : (
            <span className="demo-muted text-xs">N/A</span>
          )}
        </td>
        <td>
          <svg
            className={`h-4 w-4 text-[var(--sea-ink-soft)] transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td
            colSpan={7}
            className="bg-[color-mix(in_oklab,var(--surface)_60%,transparent)] p-0"
          >
            <div className="space-y-4 p-5">
              {/* Customer message */}
              <div>
                <p className="demo-section-title mb-1">Customer Message</p>
                <p className="demo-muted m-0 text-sm">
                  {refund.customerMessage || "No message provided."}
                </p>
              </div>

              {/* AI Reasoning */}
              {refund.aiReasoning && (
                <div>
                  <p className="demo-section-title mb-1">AI Reasoning</p>
                  <p className="demo-muted m-0 text-sm leading-relaxed">
                    {refund.aiReasoning}
                  </p>
                </div>
              )}

              {/* Policy violations */}
              {refund.policyViolations &&
                refund.policyViolations.length > 0 && (
                  <div>
                    <p className="demo-section-title mb-2">Policy Violations</p>
                    <ul className="m-0 list-none space-y-1 p-0">
                      {refund.policyViolations.map((v, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 text-amber-500">&#9888;</span>
                          <span className="text-[var(--sea-ink)]">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Order items */}
              {refund.order?.items && refund.order.items.length > 0 && (
                <div>
                  <p className="demo-section-title mb-2">Order Items</p>
                  <div className="space-y-1.5">
                    {refund.order.items.map((item) => (
                      <div
                        key={item.id}
                        className="demo-list-item flex items-center justify-between text-sm"
                      >
                        <span>
                          {item.name} x{item.quantity}
                          {item.isDamaged && (
                            <span className="ml-1.5 text-xs text-amber-500">
                              (damaged)
                            </span>
                          )}
                        </span>
                        <span className="font-semibold">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
