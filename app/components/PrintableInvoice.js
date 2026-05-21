"use client";

import React, { useState, useEffect } from "react";

const PrintableInvoice = React.forwardRef(({ invoice, customer, invoiceId }, ref) => {
  const [fullInvoiceData, setFullInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templateSettings, setTemplateSettings] = useState(null);

  // Fetch template settings
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch('/api/invoice-template');
        if (response.ok) {
          const data = await response.json();
          setTemplateSettings(data);
        }
      } catch (error) {
        console.error('Error fetching template settings:', error);
      }
    };
    fetchTemplate();
  }, []);

  useEffect(() => {
    const fetchFullInvoice = async () => {
      if (!invoiceId) {
        setFullInvoiceData(invoice);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

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
  const invoiceItems = invoiceData?.invoice_items || invoiceData?.items || [];
  const reservationFees = invoiceData?.reservation_fees || [];

  if (loading) {
    return (
      <div ref={ref} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading invoice data...</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "0.00";
    return numAmount.toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const subtotal = invoiceItems.reduce((sum, item) => {
    const itemTotal = (parseFloat(item.sale_amount) || 0) - (parseFloat(item.discount) || 0);
    return sum + itemTotal;
  }, 0);

  const totalReservationFees = reservationFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
  const vatRate = 0.05;
  const vatAmount = subtotal * vatRate;
  const netTotal = subtotal + vatAmount;
  const balanceDue = netTotal - (parseFloat(invoiceData.paid_amount) || 0);

  return (
    <div ref={ref} style={{ width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', backgroundColor: '#f5f5f5', color: '#000', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Invoice Template Preview</h1>
        <p style={{ fontSize: '11px', color: '#666', margin: '0' }}>This is a preview of how your invoice will look. This is not an actual invoice.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
        {/* Header Section with Company Info, Logo, and Invoice Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', marginBottom: '30px', alignItems: 'start' }}>
          {/* Left: Company Information */}
          <div style={{ fontSize: '11px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
              {templateSettings?.company_name || 'Dubai Main Branch'}
            </h2>
            <p style={{ margin: '2px 0' }}>{templateSettings?.company_address || 'PO Box 12345, Dubai, UAE'}</p>
            {templateSettings?.contact_number_1 && (
              <p style={{ margin: '2px 0' }}>{templateSettings.contact_number_1}</p>
            )}
            {templateSettings?.contact_email && (
              <p style={{ margin: '2px 0' }}>{templateSettings.contact_email}</p>
            )}
            {templateSettings?.trn_number && (
              <p style={{ margin: '2px 0' }}>TRN: {templateSettings.trn_number}</p>
            )}
          </div>

          {/* Center: Company Logo */}
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            {templateSettings?.logo_url ? (
              <img src={templateSettings.logo_url} alt="Company Logo" style={{ maxHeight: '80px', maxWidth: '120px', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '120px', height: '80px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
                Company Logo
              </div>
            )}
          </div>

          {/* Right: Invoice Header and Details */}
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#999', letterSpacing: '2px' }}>
              {templateSettings?.invoice_header || 'PROFORMA'}<br/>INVOICE
            </h1>
            <p style={{ margin: '3px 0', fontSize: '11px' }}>
              <strong>#{invoiceData.invoice_number || 'INV-00123'}</strong>
            </p>
            <p style={{ margin: '3px 0', fontSize: '11px' }}>
              Date: {formatDate(invoiceData.invoice_date) || '5/20/2026'}
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '11px' }}>
              <strong>Invoiced By:</strong> {invoiceData.created_by?.name || 'Admin User'}
            </p>
          </div>
        </div>

        {/* Bill To Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Bill To:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '11px' }}>
            <div>
              <p style={{ margin: '3px 0' }}><strong>Customer Name</strong></p>
              <p style={{ margin: '3px 0' }}>{customer?.full_name || 'Customer Name'}</p>
            </div>
            <div>
              <p style={{ margin: '3px 0' }}><strong>Customer Contact</strong></p>
              <p style={{ margin: '3px 0' }}>{customer?.phone || 'Other Details...'}</p>
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px' }}>
            <p style={{ margin: '3px 0' }}><strong>Customer Address</strong></p>
            <p style={{ margin: '3px 0' }}>{customer?.address || 'Address...'}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Stock Number</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Item</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Sale Description</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Quantity</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Unit P (inc VAT)</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Discount</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Total (incl VAT)</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' }}>Reservation Fee</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems && invoiceItems.length > 0 ? (
              invoiceItems.map((item, index) => {
                const saleAmount = parseFloat(item.sale_amount) || 0;
                const discount = parseFloat(item.discount) || 0;
                const itemTotal = saleAmount - discount;
                const reservationFee = parseFloat(item.reservation_fee) || 0;
                
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '10px 8px', fontSize: '10px', verticalAlign: 'top' }}>{item.stock_number || item.po_item?.stock_number || '-'}</td>
                    <td style={{ padding: '10px 8px', fontSize: '10px', verticalAlign: 'top' }}>{item.item_name || item.po_item?.item_name || item.po_item?.stock_item?.name || '-'}</td>
                    <td style={{ padding: '10px 8px', fontSize: '10px', verticalAlign: 'top' }}>{item.sale_description || item.po_item?.po_description || 'Note for Item ' + (index + 1)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '10px', verticalAlign: 'top' }}>{item.quantity || 1}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', verticalAlign: 'top' }}>{formatCurrency(saleAmount)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', verticalAlign: 'top' }}>{formatCurrency(discount)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', verticalAlign: 'top' }}>{formatCurrency(itemTotal)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '10px', verticalAlign: 'top' }}>{formatCurrency(reservationFee)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', fontSize: '10px', color: '#666' }}>No items</td>
              </tr>
            )}
          </tbody>
        </table>

        {reservationFees && reservationFees.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Reservation Details:</h3>
            {reservationFees.map((fee, index) => (
              <p key={index} style={{ margin: '3px 0', fontSize: '10px' }}>
                {fee.date ? formatDate(fee.date) : `PI ${index + 1}`}: AED {formatCurrency(fee.amount)}
              </p>
            ))}
            <p style={{ margin: '10px 0 0 0', fontSize: '10px', fontWeight: 'bold' }}>
              Total Reservation Fees: AED {formatCurrency(totalReservationFees)}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
              <span style={{ fontSize: '11px' }}>Subtotal:</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
              <span style={{ fontSize: '11px' }}>VAT (5%):</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{formatCurrency(vatAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '2px solid #000', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Net Total:</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>AED {formatCurrency(netTotal)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>Balance Due:</p>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>AED {formatCurrency(balanceDue)}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>
          <p style={{ fontSize: '10px', color: '#28a745', fontWeight: 'bold', margin: '0 0 20px 0' }}>PO   LEDO</p>
          
          <div>
            <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Remarks of Purchase:</p>
            <p style={{ fontSize: '10px', color: '#666', margin: '0', fontStyle: 'italic' }}>
              {templateSettings?.remarks_of_purchase || invoiceData.invoice_notes || 'All items verified by customer at time of purchase.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';

export default PrintableInvoice;
