"use client";

import React, { useState, useEffect } from "react";

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
        {/* ================= CSS ================= */}

        <style jsx>{`
          .invoice-wrapper {
            width: 95%;
            max-width: 1100px;
            margin: 0 auto;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            color: #000;
            box-sizing: border-box;
          }

          :global(.dark) .invoice-wrapper {
            background: #18181b;
          }

          .invoice-preview {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #000;
          }

          :global(.dark) .invoice-preview {
            background: #27272a;
            color: #fff;
          }

          .invoice-box {
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            overflow: hidden;
            color: #000;
          }

          :global(.dark) .invoice-box {
            background: #27272a;
            color: #e4e4e7;
          }

          /* HEADER */

          .invoice-header {
            display: grid;
            grid-template-columns: 1fr 120px 1fr;
            gap: 20px;
            margin-bottom: 30px;
            align-items: start;
          }

          .company-info h2 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
          }

          :global(.dark) .company-info h2 {
            color: #fff;
          }

          .company-info p {
            margin: 3px 0;
            font-size: 11px;
            word-break: break-word;
            color: #333;
          }

          :global(.dark) .company-info p {
            color: #d4d4d8;
          }

          .logo-box {
            text-align: center;
          }

          .logo-box img {
            max-width: 120px;
            max-height: 80px;
            width: auto;
            height: auto;
            object-fit: contain;
          }

          .invoice-right {
            text-align: right;
          }

          .invoice-title {
            font-size: 22px;
            font-weight: bold;
            color: #999;
            line-height: 1.2;
            margin-bottom: 10px;
            letter-spacing: 1px;
          }

          .invoice-right p {
            margin: 4px 0;
            font-size: 11px;
            color: #333;
          }

          :global(.dark) .invoice-right p {
            color: #d4d4d8;
          }

          /* BILL TO */

          .bill-section {
            margin-bottom: 30px;
          }

          .bill-section h3 {
            font-size: 12px;
            margin-bottom: 10px;
            color: #000;
          }

          :global(.dark) .bill-section h3 {
            color: #fff;
          }

          .bill-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .bill-grid p,
          .address-box p {
            margin: 3px 0;
            font-size: 11px;
            word-break: break-word;
            color: #333;
          }

          :global(.dark) .bill-grid p,
          :global(.dark) .address-box p {
            color: #d4d4d8;
          }

          .bill-grid strong,
          .address-box strong {
            color: #000;
          }

          :global(.dark) .bill-grid strong,
          :global(.dark) .address-box strong {
            color: #fff;
          }

          .address-box {
            margin-top: 10px;
          }

          /* TABLE */

          .table-wrapper {
            width: 100%;
            overflow-x: auto;
            margin-bottom: 20px;
          }

          .invoice-table {
            width: 100%;
            min-width: 950px;
            border-collapse: collapse;
          }

          .invoice-table th {
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            padding: 10px 8px;
            font-size: 10px;
            font-weight: bold;
            text-align: left;
            white-space: nowrap;
            color: #000;
          }

          :global(.dark) .invoice-table th {
            background: #3f3f46;
            border-bottom: 1px solid #52525b;
            color: #fff;
          }

          .invoice-table td {
            border-bottom: 1px solid #dee2e6;
            padding: 10px 8px;
            font-size: 10px;
            vertical-align: top;
            color: #333;
          }

          :global(.dark) .invoice-table td {
            border-bottom: 1px solid #52525b;
            color: #d4d4d8;
          }

          .invoice-table td strong {
            color: #000;
          }

          :global(.dark) .invoice-table td strong {
            color: #fff;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          /* SUMMARY */

          .summary-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }

          .summary-box {
            width: 320px;
            max-width: 100%;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
            font-size: 11px;
            color: #333;
          }

          :global(.dark) .summary-row {
            border-bottom: 1px solid #52525b;
            color: #d4d4d8;
          }

          .summary-row strong {
            color: #000;
          }

          :global(.dark) .summary-row strong {
            color: #fff;
          }

          .summary-total {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 2px solid #000;
            font-size: 12px;
            font-weight: bold;
            color: #000;
          }

          :global(.dark) .summary-total {
            border-bottom: 2px solid #fff;
            color: #fff;
          }

          /* BALANCE */

          .balance-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
          }

          .balance-row h3 {
            margin: 0;
            font-size: 15px;
            font-weight: bold;
            color: #000;
          }

          :global(.dark) .balance-row h3 {
            color: #fff;
          }

          /* FOOTER */

          .footer-section {
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
          }

          :global(.dark) .footer-section {
            border-top: 1px solid #52525b;
          }

          .footer-section p {
            margin: 0 0 10px;
            font-size: 10px;
            color: #333;
          }

          :global(.dark) .footer-section p {
            color: #d4d4d8;
          }

          .footer-section strong {
            color: #000;
          }

          :global(.dark) .footer-section strong {
            color: #fff;
          }

          .purchase-note {
            color: #666;
            font-style: italic;
          }

          :global(.dark) .purchase-note {
            color: #a1a1aa;
          }

          /* LOADING */

          .invoice-loading {
            width: 100%;
            min-height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fff;
            color: #000;
          }

          :global(.dark) .invoice-loading {
            background: #27272a;
            color: #fff;
          }

          /* =====================================================
             MOBILE RESPONSIVE
          ===================================================== */

          @media screen and (max-width: 768px) {
            .invoice-wrapper {
              padding: 5px;
              border-radius: 0;
            }

            .invoice-preview {
              padding: 15px;
              margin-bottom: 10px;
            }

            .invoice-box {
              padding: 15px;
              border-radius: 0;
            }

            /* Header */

            .invoice-header {
              grid-template-columns: 1fr;
              text-align: center;
              gap: 15px;
            }

            .invoice-right {
              text-align: center;
            }

            .invoice-title {
              font-size: 18px;
            }

            .logo-box {
              order: -1;
            }

            .logo-box img {
              max-width: 100px;
              max-height: 70px;
            }

            /* Bill */

            .bill-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            /* Table */

            .invoice-table {
              min-width: 850px;
            }

            .invoice-table th,
            .invoice-table td {
              font-size: 9px;
              padding: 8px 6px;
            }

            /* Summary */

            .summary-wrapper {
              justify-content: center;
            }

            .summary-box {
              width: 100%;
            }

            /* Balance */

            .balance-row {
              flex-direction: column;
              gap: 10px;
              text-align: center;
            }

            .balance-row h3 {
              font-size: 14px;
            }
          }

          /* SMALL MOBILE */

          @media screen and (max-width: 480px) {
            .invoice-box {
              padding: 12px;
            }

            .invoice-preview {
              padding: 12px;
            }

            .invoice-title {
              font-size: 16px;
            }

            .company-info h2 {
              font-size: 13px;
            }

            .company-info p,
            .bill-grid p,
            .address-box p,
            .invoice-right p {
              font-size: 10px;
            }

            .invoice-table th,
            .invoice-table td {
              font-size: 8px;
              padding: 6px 4px;
            }

            .summary-row,
            .summary-total {
              font-size: 10px;
            }

            .balance-row h3 {
              font-size: 13px;
            }
          }

          /* PRINT */

          @media print {
            .invoice-wrapper {
              background: #fff !important;
              padding: 0;
              max-width: 100%;
            }

            .invoice-preview {
              display: none;
            }

            .invoice-box {
              padding: 0;
              border-radius: 0;
              box-shadow: none;
              background: #fff !important;
              color: #000 !important;
            }

            .invoice-box * {
              color: #000 !important;
              border-color: #dee2e6 !important;
            }

            .invoice-table th {
              background: #f8f9fa !important;
              color: #000 !important;
            }

            .summary-total {
              border-bottom: 2px solid #000 !important;
            }
          }
        `}</style>

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
                            <td>
                              {item.stock_number ||
                                item.po_item?.stock_number ||
                                "N/A"}
                            </td>

                            <td>
                              {item.item_name ||
                                item.po_item?.stock_item?.name ||
                                item.po_item?.po_description ||
                                "N/A"}
                            </td>

                            <td>
                              {item.sale_description ||
                                item.po_item?.po_description ||
                                "N/A"}
                            </td>

                            <td className="text-center">
                              {item.quantity || 1}
                            </td>

                            <td className="text-right">
                              {formatCurrency(
                                saleAmount
                              )}
                            </td>

                            <td className="text-right">
                              {formatCurrency(
                                discount
                              )}
                            </td>

                            <td className="text-right">
                              <strong>
                                {formatCurrency(
                                  itemTotal
                                )}
                              </strong>
                            </td>

                            <td className="text-right">
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
            <div className="footer-section">
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
          </div>
        </div>
      </>
    );
  }
);

PrintableInvoice.displayName =
  "PrintableInvoice";

export default PrintableInvoice;