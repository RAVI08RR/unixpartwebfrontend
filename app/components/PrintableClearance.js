"use client";

import React from "react";

const PrintableClearance = React.forwardRef(function PrintableClearance(
  { container, items = [], branches = [], suppliers = [] },
  ref
) {
  if (!container) return null;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const supplier = suppliers?.find((s) => s.id === container.supplier_id);
  const supplierName = supplier?.company || supplier?.name || container.supplier_id || "—";
  const supplierContact = supplier?.contact_number || supplier?.phone || "—";
  const supplierAddress = supplier?.address || "—";

  const embeddedBranch = container.destination_branch || container.branch;
  const branch = branches?.find((b) => String(b.id) === String(container.destination_branch_id));
  const branchName =
    embeddedBranch?.branch_name ||
    embeddedBranch?.label ||
    embeddedBranch?.name ||
    embeddedBranch?.branch_code ||
    branch?.branch_name ||
    branch?.label ||
    branch?.name ||
    branch?.branch_code ||
    (container.destination_branch_id ? `Branch ${container.destination_branch_id}` : "—");

  const statusColor = {
    draft: "#6b7280",
    published: "#4f46e5",
    shipped: "#2563eb",
    arrived: "#16a34a",
    cleared: "#7c3aed",
  };

  const status = (container.invoice_status || "draft").toLowerCase();

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        background: "#fff",
        color: "#111",
        padding: "40px 48px",
        minHeight: "297mm",
        maxWidth: "210mm",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, borderBottom: "3px solid #111", paddingBottom: 20 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", textTransform: "uppercase" }}>
            CUSTOM CLEARANCE
          </div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 4, fontWeight: 600 }}>
            Container Shipment Documentation
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#c00" }}>{supplierName}</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4, lineHeight: 1.6 }}>
            {supplierAddress}<br />
            Phone: {supplierContact}<br />
            {supplier?.email && `Email: ${supplier.email}`}
          </div>
        </div>
      </div>

      {/* ── Container Identity ── */}
      <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
        <div style={{ flex: 1, background: "#f8f8f8", border: "1px solid #e5e5e5", borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Invoice Number</div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", textTransform: "uppercase" }}>{container.invoice_number || "—"}</div>
        </div>
        <div style={{ flex: 1, background: "#f8f8f8", border: "1px solid #e5e5e5", borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Container Number</div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>{container.container_number || "—"}</div>
        </div>
        <div style={{ flex: 0, minWidth: 120, background: statusColor[status] || "#111", borderRadius: 8, padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Status</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{status}</div>
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", border: "1px solid #e5e5e5", borderRadius: 8, overflow: "hidden", marginBottom: 28 }}>
        {[
          { label: "Total Packages", value: container.total_packages },
          { label: "Container Size", value: container.container_size },
          { label: "Vessel Name", value: container.vessel_name },
          { label: "Voyage Number", value: container.voyage_number },
          { label: "Shipping Agent", value: container.shipping_agent },
          { label: "Port of Loading", value: container.port_of_loading },
          { label: "Port of Discharging", value: container.port_of_discharging },
          { label: "Destination Branch", value: branchName },
          { label: "Supplier", value: supplierName },
        ].map((field, i) => (
          <div
            key={i}
            style={{
              padding: "14px 16px",
              borderRight: (i + 1) % 3 !== 0 ? "1px solid #e5e5e5" : "none",
              borderBottom: i < 6 ? "1px solid #e5e5e5" : "none",
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>
              {field.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
              {field.value || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* ── Items Table ── */}
      {items && items.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555", marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #eee" }}>
            Container Items ({items.length})
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#111", color: "#fff" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>S.No</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Item Name</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Description</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Qty</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Unit Price</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 900, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const unitPrice = parseFloat(item.unit_price || 0);
                const qty = parseInt(item.quantity || 1);
                const total = unitPrice * qty;
                return (
                  <tr
                    key={item.id || idx}
                    style={{ background: idx % 2 === 0 ? "#fafafa" : "#fff", borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#555" }}>{idx + 1}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                      {item.stock_item?.name || item.item?.name || item.item_name || "—"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#555" }}>
                      {item.item_description || "—"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{qty}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>
                      {unitPrice > 0 ? `AED ${unitPrice.toFixed(2)}` : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 900 }}>
                      {total > 0 ? `AED ${total.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals row */}
            {items.some((i) => parseFloat(i.unit_price || 0) > 0) && (
              <tfoot>
                <tr style={{ background: "#111", color: "#fff" }}>
                  <td colSpan={5} style={{ padding: "12px", textAlign: "right", fontWeight: 900, fontSize: 13, letterSpacing: "0.05em" }}>
                    TOTAL AMOUNT
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: 900, fontSize: 14 }}>
                    AED{" "}
                    {items
                      .reduce(
                        (sum, item) =>
                          sum +
                          parseFloat(item.unit_price || 0) *
                            parseInt(item.quantity || 1),
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* ── Notes Section ── */}
      {container.notes && (
        <div style={{ marginBottom: 28, padding: "16px 20px", background: "#f8f8f8", border: "1px solid #e5e5e5", borderRadius: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            Notes
          </div>
          <div style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}>
            {container.notes}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Printed On</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{today}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Authorized Signature</div>
          <div style={{ width: 180, borderBottom: "1px solid #555", marginBottom: 4 }} />
          <div style={{ fontSize: 11, color: "#555" }}>UNIXPARTS TRADING LLC</div>
        </div>
      </div>
    </div>
  );
});

PrintableClearance.displayName = "PrintableClearance";
export default PrintableClearance;
