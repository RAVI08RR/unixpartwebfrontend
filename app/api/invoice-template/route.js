import { NextResponse } from 'next/server';

// In-memory storage (in production, this should be in a database)
let invoiceTemplate = {
  logo_url: "",
  company_name: "UNIXPARTS TRADING LLC",
  company_address: "PO Box 12345, Dubai, UAE",
  contact_number_1: "+971 4 555 0101",
  contact_number_2: "",
  contact_email: "accounts@company.com",
  trn_number: "100123456789012",
  invoice_header: "PROFORMA INVOICE",
  remarks_of_purchase: "All items verified by customer at time of purchase.",
  paper_size: "A4",
  orientation: "Portrait"
};

export async function GET(request) {
  try {
    return NextResponse.json(invoiceTemplate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invoice template' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Update the template
    invoiceTemplate = {
      ...invoiceTemplate,
      ...body
    };

    return NextResponse.json({ 
      message: 'Invoice template updated successfully',
      data: invoiceTemplate 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update invoice template' },
      { status: 500 }
    );
  }
}
