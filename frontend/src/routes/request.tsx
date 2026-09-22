import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useCustomersQuery,
  useCustomerOrdersQuery,
  useCreateRefundMutation,
} from "../queries/refunds";
import type { Order, RefundRequest } from "../lib/api";

export const Route = createFileRoute("/request")({
  component: RequestPage,
});

function RequestPage() {
  const [customerId, setCustomerId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<RefundRequest | null>(null);

  const customersQuery = useCustomersQuery();
  const ordersQuery = useCustomerOrdersQuery(customerId);
  const createMutation = useCreateRefundMutation();

  function handleCustomerChange(id: string) {
    setCustomerId(id);
    setSelectedOrder(null);
    setResult(null);
  }

  function handleOrderSelect(order: Order) {
    setSelectedOrder(order);
    setResult(null);
  }

  async function handleSubmit() {
    if (!customerId || !selectedOrder || !message.trim()) return;

    const response = await createMutation.mutateAsync({
      customerId,
      orderId: selectedOrder.id,
      customerMessage: message.trim(),
    });

    setResult(response);
  }

  function handleReset() {
    setCustomerId("");
    setSelectedOrder(null);
    setMessage("");
    setResult(null);
  }

  return (
    <div className="demo-page rise-in">
      <div className="mx-auto max-w-2xl">
        <p className="island-kicker mb-3">Refund Request</p>
        <h1 className="demo-title mb-2 text-2xl">Submit a Refund Request</h1>
        <p className="demo-muted mb-8 text-sm">
          Select a customer and order, then describe the reason for your refund.
        </p>

        {/* Result card - shown after submission */}
        {result ? (
          <ResultCard result={result} onReset={handleReset} />
        ) : (
          <div className="space-y-6">
            {/* Step 1: Customer selector */}
            <div className="demo-panel">
              <label className="demo-section-title mb-3 block">
                <StepBadge step={1} /> Select Customer
              </label>
              {customersQuery.isLoading ? (
                <div className="h-11 animate-pulse rounded-xl bg-[var(--line)]" />
              ) : customersQuery.isError ? (
                <p className="m-0 text-sm text-red-500">
                  Failed to load customers. Is the backend running?
                </p>
              ) : (
                <select
                  className="demo-select"
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <option value="">Choose a customer...</option>
                  {customersQuery.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: Order selector */}
            {customerId && (
              <div className="demo-panel">
                <label className="demo-section-title mb-3 block">
                  <StepBadge step={2} /> Select Order
                </label>
                {ordersQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-[var(--line)]"
                      />
                    ))}
                  </div>
                ) : ordersQuery.isError ? (
                  <p className="m-0 text-sm text-red-500">
                    Failed to load orders.
                  </p>
                ) : ordersQuery.data?.length === 0 ? (
                  <p className="demo-muted m-0 text-sm">
                    No orders found for this customer.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ordersQuery.data?.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isSelected={selectedOrder?.id === order.id}
                        onSelect={() => handleOrderSelect(order)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Message */}
            {selectedOrder && (
              <div className="demo-panel">
                <label className="demo-section-title mb-3 block">
                  <StepBadge step={3} /> Describe the Issue
                </label>
                <textarea
                  className="demo-textarea"
                  placeholder="Please describe why you are requesting a refund..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {/* Submit */}
            {selectedOrder && message.trim() && (
              <button
                className="demo-button w-full text-base"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Spinner /> Processing...
                  </>
                ) : (
                  "Submit Refund Request"
                )}
              </button>
            )}

            {createMutation.isError && (
              <div className="demo-alert demo-alert-danger">
                <p className="m-0 text-sm font-semibold">Submission failed</p>
                <p className="demo-muted m-0 mt-1 text-sm">
                  {createMutation.error?.message ||
                    "An unexpected error occurred."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function StepBadge({ step }: { step: number }) {
  return (
    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--lagoon)_20%,transparent)] text-xs font-bold text-[var(--lagoon-deep)]">
      {step}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function OrderCard({
  order,
  isSelected,
  onSelect,
}: {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`demo-list-item w-full cursor-pointer text-left transition-all ${
        isSelected
          ? "border-[var(--lagoon-deep)] bg-[color-mix(in_oklab,var(--lagoon)_10%,var(--chip-bg))]"
          : "hover:border-[var(--lagoon)]"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--sea-ink)]">
          Order #{order.orderNumber}
        </span>
        <div className="flex items-center gap-2">
          {order.isFinalSale && (
            <span className="demo-pill border-red-200 bg-red-50 text-red-600">
              Final Sale
            </span>
          )}
          <StatusBadge status={order.status} />
        </div>
      </div>
      <div className="space-y-1">
        {order.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs"
          >
            <span className="demo-muted">
              {item.name} x{item.quantity}
              {item.isDamaged && (
                <span className="ml-1 text-amber-500">(damaged)</span>
              )}
            </span>
            <span className="text-[var(--sea-ink)]">
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-2">
        <span className="text-xs text-[var(--sea-ink-soft)]">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
        <span className="text-sm font-bold text-[var(--sea-ink)]">
          ${Number(order.totalAmount).toFixed(2)}
        </span>
      </div>
    </button>
  );
}

function ResultCard({
  result,
  onReset,
}: {
  result: RefundRequest;
  onReset: () => void;
}) {
  const decisionColors: Record<string, string> = {
    APPROVED: "border-emerald-300 bg-emerald-50 text-emerald-700",
    DENIED: "border-red-300 bg-red-50 text-red-700",
    ESCALATED: "border-amber-300 bg-amber-50 text-amber-700",
    PENDING:
      "border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)]",
  };

  const decision = result.aiDecision || result.status;
  const colorClass = decisionColors[decision] || decisionColors.PENDING;

  return (
    <div className="demo-panel space-y-5">
      <div className="text-center">
        <span
          className={`inline-block rounded-full border px-4 py-2 text-lg font-bold ${colorClass}`}
        >
          {decision}
        </span>
      </div>

      {result.confidence !== null && (
        <div className="text-center">
          <p className="demo-muted m-0 mb-1 text-xs font-semibold uppercase tracking-wider">
            Confidence
          </p>
          <div className="mx-auto max-w-xs">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--lagoon),var(--lagoon-deep))] transition-all duration-500"
                style={{ width: `${Math.round(result.confidence * 100)}%` }}
              />
            </div>
            <p className="m-0 mt-1 text-sm font-bold text-[var(--sea-ink)]">
              {Math.round(result.confidence * 100)}%
            </p>
          </div>
        </div>
      )}

      {result.aiReasoning && (
        <div>
          <p className="demo-section-title mb-2">AI Reasoning</p>
          <p className="demo-muted m-0 text-sm leading-relaxed">
            {result.aiReasoning}
          </p>
        </div>
      )}

      {result.policyViolations && result.policyViolations.length > 0 && (
        <div>
          <p className="demo-section-title mb-2">Policy Violations</p>
          <ul className="m-0 list-none space-y-1.5 p-0">
            {result.policyViolations.map((v, i) => (
              <li
                key={i}
                className="demo-list-item flex items-start gap-2 border-amber-200 bg-amber-50/50 text-sm"
              >
                <span className="mt-0.5 text-amber-500">&#9888;</span>
                <span className="text-[var(--sea-ink)]">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="demo-button demo-button-secondary w-full"
        onClick={onReset}
      >
        Submit Another Request
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    SHIPPED: "border-blue-200 bg-blue-50 text-blue-700",
    PROCESSING: "border-amber-200 bg-amber-50 text-amber-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
  };

  return <span className={`demo-pill ${colors[status] || ""}`}>{status}</span>;
}
