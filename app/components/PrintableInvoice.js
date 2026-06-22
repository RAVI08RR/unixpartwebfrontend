"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

const PrintableInvoice = React.forwardRef(
  ({ invoice, customer, invoiceId }, ref) => {
    const [fullInvoiceData, setFullInvoiceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [templateSettings, setTemplateSettings] = useState(null);

    // Fetch Template Settings
    useEffect(() => {
      const fetchTemplate = async () => {
        try {
          const response = await fetch("/api/invoice-template");

          if (response.ok) {
            const data = await response.json();
            setTemplateSettings(data);
          }
        } catch (error) {
          console.error(
            "Error fetching template settings:",
            error
          );
        }
      };

      fetchTemplate();
    }, []);

    // Fetch Full Invoice
    useEffect(() => {
      const fetchFullInvoice = async () => {
        if (!invoiceId) {
          setFullInvoiceData(invoice);
          return;
        }

        setLoading(true);

        try {
          const token =
            localStorage.getItem("access_token");

          const response = await fetch(
            `/api/invoices/${invoiceId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setFullInvoiceData(data);
          } else {
            setFullInvoiceData(invoice);
          }
        } catch (error) {
          setFullInvoiceData(invoice);
        } finally {
          setLoading(false);
        }
      };

      fetchFullInvoice();
    }, [invoiceId, invoice]);

    const invoiceData = fullInvoiceData || invoice;

    const invoiceItems =
      invoiceData?.invoice_items ||
      invoiceData?.items ||
      [];

    const reservationFees =
      invoiceData?.reservation_fees || [];

    // Loading
    if (loading) {
      return (
        <div ref={ref} className="invoice-loading">
          <p>Loading invoice data...</p>
        </div>
      );
    }

    // Currency Format
    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return "0.00";

      const numAmount = parseFloat(amount);

      if (isNaN(numAmount)) return "0.00";

      return numAmount.toFixed(2);
    };

    // Date Format
    const formatDate = (dateString) => {
      if (!dateString) return "-";

      return new Date(dateString).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
    };

    // Totals
    const subtotal = invoiceItems.reduce(
      (sum, item) => {
        const itemTotal =
          (parseFloat(item.sale_amount) || 0) -
          (parseFloat(item.discount) || 0);

        return sum + itemTotal;
      },
      0
    );

    const totalReservationFees =
      reservationFees.reduce(
        (sum, fee) =>
          sum + (parseFloat(fee.amount) || 0),
        0
      );

    const vatRate = 0.05;
    const vatAmount = subtotal * vatRate;
    const netTotal = subtotal + vatAmount;

    const balanceDue =
      netTotal -
      (parseFloat(invoiceData.paid_amount) || 0);

    return (
      <>
        {/* ================= UI ================= */}

        <div ref={ref} className="invoice-wrapper">
          {/* Invoice Box */}
          <div className="invoice-box">
            {/* Header */}
            <div className="invoice-header">
              {/* Company Info */}
              <div className="company-info">
                <h2>
                  {templateSettings?.company_name ||
                    "UNIXPARTS TRADING LLC"}
                </h2>

                {/* Branch Name - Dynamic from invoice or customer */}
                {(invoiceData?.branch?.branch_name || customer?.branch_name) && (
                  <p style={{ fontWeight: "bold", fontSize: "12px" }}>
                    {invoiceData?.branch?.branch_name || customer?.branch_name}
                  </p>
                )}

                <p>
                  {invoiceData?.branch?.address || 
                    customer?.address ||
                    templateSettings?.company_address ||
                    "PO Box 12345, Dubai, UAE"}
                </p>

                {(invoiceData?.branch?.phone || customer?.phone || templateSettings?.contact_number_1) && (
                  <p>
                    {invoiceData?.branch?.phone || customer?.phone || templateSettings?.contact_number_1}
                  </p>
                )}

                {(invoiceData?.branch?.email || customer?.email || templateSettings?.contact_email) && (
                  <p>
                    {invoiceData?.branch?.email || customer?.email || templateSettings?.contact_email}
                  </p>
                )}

                {templateSettings?.trn_number && (
                  <p>
                    TRN:{" "}
                    {templateSettings.trn_number}
                  </p>
                )}
              </div>

              {/* Logo */}
              <div className="logo-box">
                <img
                  src={
                    templateSettings?.logo_url ||
                    "/logo.png"
                  }
                  alt="Company Logo"
                />
              </div>

              {/* Invoice Right */}
              <div className="invoice-right">
                <h1 className="invoice-title">
                  PROFORMA
                  <br />
                  INVOICE
                </h1>

                <p>
                  <strong>
                    Invoice #: {invoiceData?.invoice_number || "N/A"}
                  </strong>
                </p>

                <p>
                  Date:{" "}
                  {formatDate(invoiceData?.invoice_date)}
                </p>

                <p>
                  <strong>Invoiced By:</strong>{" "}
                  {invoiceData?.created_by?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="bill-section">
              <h3>Bill To:</h3>

              <div className="bill-grid">
                <div>
                  <p>
                    <strong>
                      Customer Name
                    </strong>
                  </p>

                  <p>
                    {customer?.full_name || invoiceData?.customer?.full_name || "N/A"}
                  </p>
                  
                  {(customer?.business_name || invoiceData?.customer?.business_name) && (
                    <p style={{ fontStyle: "italic", marginTop: "5px" }}>
                      {customer?.business_name || invoiceData?.customer?.business_name}
                    </p>
                  )}
                </div>

                <div>
                  <p>
                    <strong>
                      Customer Contact
                    </strong>
                  </p>

                  <p>
                    {customer?.phone || invoiceData?.customer?.phone || "N/A"}
                  </p>
                  
                  {(customer?.customer_code || invoiceData?.customer?.customer_code) && (
                    <p style={{ marginTop: "5px" }}>
                      Code: {customer?.customer_code || invoiceData?.customer?.customer_code}
                    </p>
                  )}
                </div>
              </div>

              <div className="address-box">
                <p>
                  <strong>
                    Customer Address
                  </strong>
                </p>

                <p>
                  {customer?.address || invoiceData?.customer?.address || "N/A"}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Stock Number</th>
                    <th>Item</th>
                    <th>Sale Description</th>
                    <th className="text-center">
                      Qty
                    </th>
                    <th className="text-right">
                      Unit Price
                    </th>
                    <th className="text-right">
                      Discount
                    </th>
                    <th className="text-right">
                      Total
                    </th>
                    <th className="text-right">
                      Reservation Fee
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoiceItems &&
                  invoiceItems.length > 0 ? (
                    invoiceItems.map(
                      (item, index) => {
                        const saleAmount =
                          parseFloat(
                            item.sale_amount
                          ) || 0;

                        const discount =
                          parseFloat(
                            item.discount
                          ) || 0;

                        const itemTotal =
                          saleAmount -
                          discount;

                        const reservationFee =
                          parseFloat(
                            item.reservation_fee
                          ) || 0;

                        return (
                          <tr key={index}>
                            <td data-label="Stock Number">
                              {item.stock_number ||
                                item.po_item?.stock_number ||
                                "N/A"}
                            </td>

                            <td data-label="Item">
                              {item.item_name ||
                                item.po_item?.stock_item?.name ||
                                item.po_item?.po_description ||
                                "N/A"}
                            </td>

                            <td data-label="Sale Description">
                              {item.sale_description ||
                                item.po_item?.po_description ||
                                "N/A"}
                            </td>

                            <td className="text-center" data-label="Qty">
                              {item.quantity || 1}
                            </td>

                            <td className="text-right" data-label="Unit Price">
                              {formatCurrency(
                                saleAmount
                              )}
                            </td>

                            <td className="text-right" data-label="Discount">
                              {formatCurrency(
                                discount
                              )}
                            </td>

                            <td className="text-right" data-label="Total">
                              <strong>
                                {formatCurrency(
                                  itemTotal
                                )}
                              </strong>
                            </td>

                            <td className="text-right" data-label="Reservation Fee">
                              {formatCurrency(
                                reservationFee
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reservation Fees */}
            {reservationFees &&
              reservationFees.length > 0 && (
                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    Reservation Details:
                  </h3>

                  {reservationFees.map(
                    (fee, index) => (
                      <p
                        key={index}
                        style={{
                          fontSize: "10px",
                          marginBottom: "5px",
                        }}
                      >
                        {fee.date
                          ? formatDate(
                              fee.date
                            )
                          : `PI ${
                              index + 1
                            }`}
                        : AED{" "}
                        {formatCurrency(
                          fee.amount
                        )}
                      </p>
                    )
                  )}

                  <p
                    style={{
                      marginTop: "10px",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    Total Reservation Fees:
                    AED{" "}
                    {formatCurrency(
                      totalReservationFees
                    )}
                  </p>
                </div>
              )}

            {/* Summary */}
            <div className="summary-wrapper">
              <div className="summary-box">
                <div className="summary-row">
                  <span>Subtotal:</span>

                  <strong>
                    {formatCurrency(subtotal)}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>VAT (5%):</span>

                  <strong>
                    {formatCurrency(vatAmount)}
                  </strong>
                </div>

                <div className="summary-total">
                  <span>Net Total:</span>

                  <strong>
                    AED{" "}
                    {formatCurrency(netTotal)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="balance-row">
              <h3>Balance Due:</h3>

              <h3>
                AED{" "}
                {formatCurrency(balanceDue)}
              </h3>
            </div>

            {/* Footer */}
            <div className="footer-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <p
                  style={{
                    color: "#28a745",
                    fontWeight: "bold",
                  }}
                >
                  PO LEDO
                </p>

                <div>
                  <p>
                    <strong>
                      Remarks of Purchase:
                    </strong>
                  </p>

                  <p className="purchase-note">
                    {templateSettings?.remarks_of_purchase ||
                      invoiceData.invoice_notes ||
                      "All items verified by customer at time of purchase."}
                  </p>
                </div>
              </div>
              
              {/* Invoice QR Code */}
              {(invoiceId || invoiceData?.id) && (
                <div style={{ textAlign: "center", marginLeft: "20px" }}>
                  <QRCodeSVG 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/sales/invoices/view/${invoiceId || invoiceData?.id}`} 
                    size={80} 
                    level="M"
                  />
                  <p style={{ fontSize: "10px", marginTop: "5px", color: "#666", fontWeight: "bold" }}>Scan to View</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
);

PrintableInvoice.displayName =
  "PrintableInvoice";

export default PrintableInvoice;
