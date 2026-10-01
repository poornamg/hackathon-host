import { Clock, X, ChevronDown } from "lucide-react"
import { useState } from "react"
import type { Order } from "../data/sampleData"
import { Button, Heading, IconButton, ShopTag } from "./ui"

type DeferModalProps = {
  orders: Order[]
  deferDates: Array<{ date: string; dayOfWeek: string }>
  onClose: () => void
  onDefer: (selectedIds: string[], deferTo: string, reasons: string[], notice: string) => void
}

const REASON_OPTIONS = [
  "Shop closed",
  "Stock not ready",
  "Customer request",
  "No vehicle",
]

export function DeferModal({ orders, deferDates, onClose, onDefer }: DeferModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deferDate, setDeferDate] = useState(deferDates[0]?.date ?? "")
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)
  const [reasons, setReasons] = useState<string[]>([])
  const [notice, setNotice] = useState("")
  const [sendNotice, setSendNotice] = useState(true)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleReason = (reason: string) => {
    setReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
    )
  }

  const handleDefer = () => {
    if (!selectedIds.length || !deferDate || !reasons.length) return
    onDefer(selectedIds, deferDate, reasons, sendNotice ? notice : "")
  }

  return (
    <div
      className="modal-layer"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        aria-labelledby="defer-title"
        aria-modal="true"
        className="modal defer-modal"
        role="dialog"
      >
        <div className="modal__heading">
          <div>
            <Heading id="defer-title">Defer orders</Heading>
            <p>Pick orders, the new date and the reason</p>
          </div>
          <IconButton icon={X} label="Close modal" onClick={onClose} />
        </div>

        <div className="defer-grid">
          {/* Left: Orders List */}
          <div>
            <div style={{ marginBottom: "10px", fontSize: "13px", fontWeight: 700, color: "var(--navy-900)" }}>
              Orders · {selectedIds.length} selected
            </div>
            <div className="defer-orders-list">
              {orders.map((order) => {
                const isSelected = selectedIds.includes(order.id)
                return (
                  <div
                    className={`defer-order-row ${isSelected ? "defer-order-row--selected" : ""}`}
                    key={order.id}
                    onClick={() => toggleSelect(order.id)}
                  >
                    <input
                      aria-label={`Select ${order.id}`}
                      checked={isSelected}
                      onChange={() => toggleSelect(order.id)}
                      type="checkbox"
                    />
                    <div className="defer-order-row__content">
                      <div className="defer-order-row__top">
                        <span className="data-text">{order.id}</span>
                        <ShopTag type={order.type} />
                      </div>
                      <span className="defer-order-row__sub">
                        {order.shop} · {order.town}
                      </span>
                    </div>
                    <span className="defer-order-row__kg">{order.kg} kg</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Defer Form */}
          <div className="defer-form">
            <div className="defer-form-group" style={{ position: "relative" }}>
              <label>Defer to</label>
              <button
                className="defer-select"
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                type="button"
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={16} color="var(--navy-900)" />
                  {deferDate ? new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${deferDate}T00:00:00Z`)) : "No operating day available"}
                </span>
                <ChevronDown size={16} />
              </button>
              {dateDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 60,
                    background: "white",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-raised)",
                    marginTop: "4px",
                    padding: "6px",
                  }}
                >
                  {deferDates.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setDeferDate(day.date)
                        setDateDropdownOpen(false)
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 12px",
                        textAlign: "left",
                        border: 0,
                        borderRadius: "6px",
                        background: deferDate === day.date ? "var(--cobalt-50)" : "transparent",
                        color: deferDate === day.date ? "var(--cobalt-500)" : "var(--navy-900)",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                      type="button"
                    >
                      {new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`))}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="defer-form-group">
              <label>Reason</label>
              <div className="reason-chips">
                {REASON_OPTIONS.map((reason) => {
                  const isActive = reasons.includes(reason)
                  return (
                    <button
                      className={`reason-chip ${isActive ? "reason-chip--active" : ""}`}
                      key={reason}
                      onClick={() => toggleReason(reason)}
                      type="button"
                    >
                      {reason}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="defer-form-group">
              <label>Notice to attach</label>
              <textarea
                className="defer-textarea"
                onChange={(e) => setNotice(e.target.value)}
                placeholder="Enter notice explaining why the orders are deferred..."
                value={notice}
              />
            </div>

            <label className="defer-checkbox-label">
              <input
                checked={sendNotice}
                onChange={(e) => setSendNotice(e.target.checked)}
                type="checkbox"
              />
              Send the notice to the shops&apos; stock managers
            </label>
          </div>
        </div>

        <div className="defer-footer">
          <span>Deferred orders leave today&apos;s list and show as due on the new date.</span>
          <div className="defer-footer-actions">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              disabled={selectedIds.length === 0 || !deferDate || reasons.length === 0}
              onClick={handleDefer}
              variant="primary"
            >
              Defer {selectedIds.length} {selectedIds.length === 1 ? "order" : "orders"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
