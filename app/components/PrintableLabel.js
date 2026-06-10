"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

const PrintableLabel = React.forwardRef(({ items, styles, labelSize }, ref) => {
  return (
    <div ref={ref} className="print-container">
      <style jsx global>{`
        @media print {
          @page {
            size: ${labelSize.width}in ${labelSize.height}in;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-container {
            width: 100%;
            height: 100%;
          }
          .print-container .space-y-4 {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .print-container .space-y-4 > * + * {
            margin-top: 0 !important;
          }
          .label-item {
            margin: 0 !important;
            page-break-after: always !important;
            break-after: always !important;
          }
          .label-item:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="label-item bg-white border-2 border-gray-300 flex items-start justify-between"
            style={{
              width: `${labelSize.width}in`,
              height: `${labelSize.height}in`,
              pageBreakAfter: index < items.length - 1 ? "always" : "auto",
              boxSizing: "border-box",
              padding: labelSize.height < 1.5 ? '0.25rem' : labelSize.height < 2.5 ? '0.5rem' : '1rem',
            }}
          >
            <div className="flex-1 space-y-1">
              {/* Branch */}
              {item.branch_code && (
                <div
                  style={{
                    fontSize: `${styles.branch.fontSize}px`,
                    fontWeight: styles.branch.bold ? "bold" : "normal",
                    textDecoration: styles.branch.underline ? "underline" : "none",
                  }}
                >
                  {item.branch_code}
                </div>
              )}

              {/* Supplier Code */}
              {item.supplier_code && (
                <div
                  style={{
                    fontSize: `${styles.supplier.fontSize}px`,
                    fontWeight: styles.supplier.bold ? "bold" : "normal",
                    textDecoration: styles.supplier.underline ? "underline" : "none",
                  }}
                >
                  {item.supplier_code}
                </div>
              )}

              {/* Container */}
              {item.container_number && (
                <div
                  style={{
                    fontSize: `${styles.container.fontSize}px`,
                    fontWeight: styles.container.bold ? "bold" : "normal",
                    textDecoration: styles.container.underline ? "underline" : "none",
                  }}
                >
                  {item.container_number}
                </div>
              )}

              {/* Stock Number */}
              <div
                style={{
                  fontSize: `${styles.stockNumber.fontSize}px`,
                  fontWeight: styles.stockNumber.bold ? "bold" : "normal",
                  textDecoration: styles.stockNumber.underline ? "underline" : "none",
                }}
              >
                {item.stock_number}
              </div>

              {/* Item Description */}
              <div
                style={{
                  fontSize: `${styles.item.fontSize}px`,
                  fontWeight: styles.item.bold ? "bold" : "normal",
                  textDecoration: styles.item.underline ? "underline" : "none",
                }}
              >
                {item.item_name}
              </div>

              {/* PO Description */}
              {item.po_description && (
                <div
                  style={{
                    fontSize: `${styles.poDescription.fontSize}px`,
                    fontWeight: styles.poDescription.bold ? "bold" : "normal",
                    textDecoration: styles.poDescription.underline ? "underline" : "none",
                  }}
                >
                  {item.po_description}
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="shrink-0" style={{ marginLeft: labelSize.width < 2.5 ? '0.25rem' : '1rem' }}>
              <QRCodeSVG
                value={item.qr_data}
                size={styles.qrSize}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

PrintableLabel.displayName = "PrintableLabel";

export default PrintableLabel;
