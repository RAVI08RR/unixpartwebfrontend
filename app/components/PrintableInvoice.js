"use client";

import React, { useState, useEffect } from "react";

const PrintableInvoice = React.forwardRef(({ invoice, customer, invoiceId }, ref) => {
  const [fullInvoiceData, setFullInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch full invoice data from API if invoiceId is provided
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
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📄 Full invoice data fetched for PDF:', data);
          setFullInvoiceData(data);
        } else {
          console.error('Failed to fetch full invoice data');
          setFullInvoiceData(invoice);
        }
      } catch (error) {
        console.error('Error fetching full invoice data:', error);
        setFullInvoiceData(invoice);
      } finally {
        setLoading(false);
      }
    };

    fetchFullInvoice();
  }, [invoiceId, invoice]);

  const invoiceData = fullInvoiceData || invoice;

  // Handle both 'items' and 'invoice_items' field names from API
  const invoiceItems = invoiceData?.invoice_items || invoiceData?.items || [];

  console.log('📋 Invoice items for print:', invoiceItems);

  if (loading) {
    return (
      <div ref={ref} style={{ 
        width: '210mm', 
        minHeight: '297mm',
        padding: '15mm',
        margin: '0 auto',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Loading invoice data...</p>
      </div>
    );
  }
  const formatCurrency = (amount) => {
    if (!amount) return "AED 0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "AED 0.00";
    return `AED ${numAmount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div ref={ref} style={{ 
      width: '210mm', 
      minHeight: '297mm',
      padding: '15mm',
      margin: '0 auto',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '30px', 
        paddingBottom: '20px', 
        borderBottom: '3px solid #000' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '900', 
            margin: '0 0 15px 0', 
            letterSpacing: '1px' 
          }}>INVOICE</h1>
          <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
            <p style={{ margin: '3px 0' }}>
              <strong>INVOICE#:</strong> {invoiceData.invoice_number}
            </p>
            <p style={{ margin: '3px 0' }}>
              <strong>DATE:</strong> {formatDate(invoiceData.invoice_date)}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0' 
          }}>UNIXPARTS TRADING LLC</h2>
          <p style={{ fontSize: '12px', margin: '2px 0' }}>P.O. Box 12345, Dubai, UAE</p>
          <p style={{ fontSize: '12px', margin: '2px 0' }}>Phone: +971 XX XXX XXXX</p>
          <p style={{ fontSize: '12px', margin: '2px 0' }}>Email: info@unixparts.com</p>
        </div>
      </div>

      {/* Customer and Shipping Info */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '40px', 
        marginBottom: '25px' 
      }}>
        <div>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0', 
            letterSpacing: '0.5px' 
          }}>CUSTOMER NAME (UAE BRANCH NAME)</h3>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
            {customer?.full_name || 'N/A'}
          </p>
          <p style={{ fontSize: '12px', margin: '2px 0' }}>
            {customer?.address || 'UAE BRANCH ADDRESS'}
          </p>
          <p style={{ fontSize: '12px', margin: '2px 0' }}>
            {customer?.phone || 'UAE BRANCH CONTACT'}
          </p>
          
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '12px', margin: '0' }}>
              <strong>NOTIFYING PARTY:</strong> (SAME AS CUSTOMER NAME)
            </p>
          </div>
        </div>
        <div>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0', 
            letterSpacing: '0.5px' 
          }}>VESSEL NAME</h3>
          <p style={{ fontSize: '12px', margin: '0 0 15px 0' }}>-</p>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0', 
            letterSpacing: '0.5px' 
          }}>VOYAGE NUMBER</h3>
          <p style={{ fontSize: '12px', margin: '0' }}>-</p>
        </div>
      </div>

      {/* Shipping Route */}
      <div style={{ 
        backgroundColor: '#FFEB3B', 
        padding: '12px', 
        marginBottom: '25px' 
      }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0' }}>
          SHIPPED FROM (SUPPLIER PORT CITY, COUNTRY) → TO (UAE BRANCH PORT NAME COUNTRY)
        </p>
      </div>

      {/* Items Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        border: '2px solid #000', 
        marginBottom: '25px' 
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ 
              border: '2px solid #000', 
              borderLeft: 'none', 
              borderTop: 'none', 
              padding: '10px 8px', 
              textAlign: 'left', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              width: '6%' 
            }}>S.NO</th>
            <th style={{ 
              border: '2px solid #000', 
              borderTop: 'none', 
              padding: '10px 8px', 
              textAlign: 'left', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              width: '12%' 
            }}>STOCK #</th>
            <th style={{ 
              border: '2px solid #000', 
              borderTop: 'none', 
              padding: '10px 8px', 
              textAlign: 'left', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              width: '32%' 
            }}>ITEM</th>
            <th style={{ 
              border: '2px solid #000', 
              borderTop: 'none', 
              padding: '10px 8px', 
              textAlign: 'center', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              width: '8%' 
            }}>QTY</th>
            <th style={{ 
              border: '2px solid #000', 
              borderTop: 'none', 
              padding: '10px 8px', 
              textAlign: 'right', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              width: '18%' 
            }}>UNIT PRICE</th>
            <th style={{ 
              borderTop: 'none', 
              borderRight: 'none', 
              padding: '10px 8px', 
              textAlign: 'right', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              width: '18%' 
            }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {invoiceItems && invoiceItems.length > 0 ? (
            invoiceItems.map((item, index) => {
              const itemTotal = (parseFloat(item.sale_amount) || 0) - (parseFloat(item.discount) || 0);
              return (
                <tr key={index} style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ 
                    border: '2px solid #000', 
                    borderLeft: 'none', 
                    borderBottom: '1px solid #000', 
                    padding: '10px 8px', 
                    fontSize: '12px' 
                  }}>{index + 1}</td>
                  <td style={{ 
                    border: '2px solid #000', 
                    borderBottom: '1px solid #000', 
                    padding: '10px 8px', 
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.stock_number || item.po_item?.stock_number || '-'}
                  </td>
                  <td style={{ 
                    border: '2px solid #000', 
                    borderBottom: '1px solid #000', 
                    padding: '10px 8px', 
                    fontSize: '12px' 
                  }}>
                    {item.sale_description || item.item_name || item.po_item?.item_name || item.po_item?.po_description || '-'}
                  </td>
                  <td style={{ 
                    border: '2px solid #000', 
                    borderBottom: '1px solid #000', 
                    padding: '10px 8px', 
                    textAlign: 'center', 
                    fontSize: '12px' 
                  }}>1</td>
                  <td style={{ 
                    border: '2px solid #000', 
                    borderBottom: '1px solid #000', 
                    padding: '10px 8px', 
                    textAlign: 'right', 
                    fontSize: '12px' 
                  }}>
                    {formatCurrency(item.sale_amount)}
                  </td>
                  <td style={{ 
                    borderRight: 'none', 
                    borderBottom: '1px solid #000', 
                    padding: '10px 8px', 
                    textAlign: 'right', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}>
                    {formatCurrency(itemTotal)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ 
                padding: '20px', 
                textAlign: 'center', 
                fontSize: '12px' 
              }}>No items</td>
            </tr>
          )}
          {/* Empty rows for spacing */}
          {[...Array(Math.max(0, 5 - (invoiceItems?.length || 0)))].map((_, i) => (
            <tr key={`empty-${i}`} style={{ 
              borderBottom: '1px solid #000', 
              height: '45px' 
            }}>
              <td style={{ 
                border: '2px solid #000', 
                borderLeft: 'none', 
                borderBottom: '1px solid #000', 
                padding: '10px 8px' 
              }}>&nbsp;</td>
              <td style={{ 
                border: '2px solid #000', 
                borderBottom: '1px solid #000', 
                padding: '10px 8px' 
              }}>&nbsp;</td>
              <td style={{ 
                border: '2px solid #000', 
                borderBottom: '1px solid #000', 
                padding: '10px 8px' 
              }}>&nbsp;</td>
              <td style={{ 
                border: '2px solid #000', 
                borderBottom: '1px solid #000', 
                padding: '10px 8px' 
              }}>&nbsp;</td>
              <td style={{ 
                border: '2px solid #000', 
                borderBottom: '1px solid #000', 
                padding: '10px 8px' 
              }}>&nbsp;</td>
              <td style={{ 
                borderRight: 'none', 
                borderBottom: '1px solid #000', 
                padding: '10px 8px' 
              }}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '25px' 
      }}>
        <table style={{ 
          width: '50%', 
          borderCollapse: 'collapse', 
          border: '2px solid #000' 
        }}>
          <tbody>
            <tr>
              <td style={{ 
                border: '2px solid #000', 
                borderLeft: 'none', 
                borderTop: 'none', 
                borderBottom: 'none', 
                padding: '12px', 
                fontSize: '13px', 
                fontWeight: 'bold', 
                width: '60%' 
              }}>TOTAL AMOUNT</td>
              <td style={{ 
                borderRight: 'none', 
                borderTop: 'none', 
                borderBottom: 'none', 
                padding: '12px', 
                textAlign: 'right', 
                fontSize: '16px', 
                fontWeight: '900' 
              }}>
                {formatCurrency(invoiceData.invoice_total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Container Info */}
      <div style={{ marginBottom: '25px' }}>
        <p style={{ fontSize: '12px', margin: '0 0 5px 0' }}>1x40FT HC</p>
        <p style={{ fontSize: '12px', margin: '0' }}>
          <strong>CONTAINER NO:</strong> (STANDARD CONTAINER NUMBER)
        </p>
      </div>

      {/* Notes */}
      <div style={{ marginTop: '25px' }}>
        <div style={{ 
          backgroundColor: '#FFEB3B', 
          display: 'inline-block', 
          padding: '8px 15px', 
          marginBottom: '10px' 
        }}>
          <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0' }}>NOTES:</p>
        </div>
        {invoiceData.invoice_notes && (
          <p style={{ 
            fontSize: '12px', 
            margin: '10px 0 0 0', 
            lineHeight: '1.6' 
          }}>{invoiceData.invoice_notes}</p>
        )}
      </div>
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';

export default PrintableInvoice;
