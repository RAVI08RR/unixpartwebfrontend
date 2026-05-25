"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { containerService } from "@/app/lib/services/containerService";
import { ArrowLeft, Printer } from "lucide-react";

export default function PrintClearancePage() {
  const { id } = useParams();
  const router = useRouter();
  const printRef = useRef(null);

  const [container, setContainer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [containerData, itemsData] = await Promise.all([
          containerService.getById(id),
          containerService.getContainerItems(id),
        ]);
        setContainer(containerData);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (err) {
        console.error("Failed to load print data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-bold">Container not found.</p>
      </div>
    );
  }

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + parseFloat(item.unit_price || 0) * parseInt(item.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-sm font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300 font-black tracking-tight">
            Print Preview — {container.container_code}
          </span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-red-600/30"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* ── Page Preview ── */}
      <div className="flex-1 overflow-y-auto py-10 px-4 flex justify-center">
        <div
          ref={printRef}
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            background: "#fff",
            color: "#111",
            padding: "40px 48px",
            width: "210mm",
            minHeight: "297mm",
            boxSizing: "border-box",
            boxShadow: "0 4px 40px rgba(0,0,0,0.18)",
          }}
        >
          {/* ── Doc Header ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            {/* Left: Title */}
            <div>
              <div
                style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}
              >
                CUSTOM CLEARANCE
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12 }}>
                  <strong>CODE:</strong> {container.container_code || "—"}
                </div>
                <div style={{ fontSize: 12 }}>
                  <strong>DATE:</strong>{" "}
                  {container.created_at
                    ? new Date(container.created_at).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "long", year: "numeric" }
                      )
                    : "—"}
                </div>
              </div>
            </div>

            {/* Right: Company */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>
                UNIXPARTS TRADING LLC
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4, lineHeight: 1.7 }}>
                P.O. Box 12345, Dubai, UAE
                <br />
                Phone: +971 XX XXX XXXX
                <br />
                Email: info@unixparts.com
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ borderBottom: "2px solid #111", marginBottom: 20 }} />

          {/* ── Vessel / Shipping Info ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 40px",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#888",
                  letterSpacing: "0.1em",
                }}
              >
                VESSEL NAME
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                {container.vessel_name || "—"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#888",
                  letterSpacing: "0.1em",
                }}
              >
                VOYAGE NUMBER
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                {container.voyage_number || "—"}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#888",
                  letterSpacing: "0.1em",
                }}
              >
                SHIPPING AGENT
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                {container.shipping_agent || "—"}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#888",
                  letterSpacing: "0.1em",
                }}
              >
                CONTAINER NUMBER
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                {container.container_number || "—"}
              </div>
            </div>
          </div>

          {/* ── Shipping Route Banner ── */}
          <div
            style={{
              background: "#FFE600",
              padding: "10px 14px",
              marginBottom: 20,
              fontWeight: 900,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            SHIPPED FROM ({container.port_of_loading || "SUPPLIER PORT CITY, COUNTRY"}) →
            TO ({container.port_of_discharging || "UAE BRANCH PORT NAME COUNTRY"})
          </div>

          {/* ── Items Table ── */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              marginBottom: 0,
            }}
          >
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px 10px",
                    textAlign: "left",
                    fontWeight: 900,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    width: 40,
                  }}
                >
                  S.NO
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px 10px",
                    textAlign: "left",
                    fontWeight: 900,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  ITEM
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px 10px",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    width: 60,
                  }}
                >
                  QTY
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px 10px",
                    textAlign: "right",
                    fontWeight: 900,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    width: 110,
                  }}
                >
                  UNIT PRICE
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px 10px",
                    textAlign: "right",
                    fontWeight: 900,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    width: 110,
                  }}
                >
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const unitPrice = parseFloat(item.unit_price || 0);
                  const qty = parseInt(item.quantity || 1);
                  const amount = unitPrice * qty;
                  const itemName =
                    item.stock_item?.name ||
                    item.item?.name ||
                    item.item_name ||
                    item.item_description ||
                    "—";
                  return (
                    <tr key={item.id || idx}>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px 10px",
                          color: "#555",
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px 10px",
                          fontWeight: 600,
                        }}
                      >
                        {itemName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px 10px",
                          textAlign: "center",
                        }}
                      >
                        {qty}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px 10px",
                          textAlign: "right",
                        }}
                      >
                        {unitPrice > 0 ? `AED ${unitPrice.toFixed(2)}` : "—"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "8px 10px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {amount > 0 ? `AED ${amount.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty rows to match the invoice style */
                [...Array(4)].map((_, i) => (
                  <tr key={i} style={{ height: 36 }}>
                    <td style={{ border: "1px solid #ccc", padding: "8px 10px" }} />
                    <td style={{ border: "1px solid #ccc", padding: "8px 10px" }} />
                    <td style={{ border: "1px solid #ccc", padding: "8px 10px" }} />
                    <td style={{ border: "1px solid #ccc", padding: "8px 10px" }} />
                    <td style={{ border: "1px solid #ccc", padding: "8px 10px" }} />
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ── Total Amount ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 0 }}>
            <table style={{ borderCollapse: "collapse", minWidth: 300 }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "12px 16px",
                      fontWeight: 900,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "#f9f9f9",
                    }}
                  >
                    TOTAL AMOUNT
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "12px 16px",
                      fontWeight: 900,
                      fontSize: 14,
                      textAlign: "right",
                      minWidth: 130,
                    }}
                  >
                    AED {totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Container Size / Notes ── */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              {container.container_size || "—"}
            </div>
            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <strong>CONTAINER NO:</strong>{" "}
              ({container.container_number || "STANDARD CONTAINER NUMBER"})
            </div>
            {container.notes && (
              <div
                style={{
                  background: "#FFE600",
                  display: "inline-block",
                  padding: "4px 12px",
                  fontWeight: 900,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: 4,
                }}
              >
                NOTES: {container.notes}
              </div>
            )}
            {!container.notes && (
              <div
                style={{
                  background: "#FFE600",
                  display: "inline-block",
                  padding: "4px 12px",
                  fontWeight: 900,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: 4,
                }}
              >
                NOTES:
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
