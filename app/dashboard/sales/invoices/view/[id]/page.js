"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewInvoicePage({ params }) {
  const router = useRouter();
  const [invoiceId, setInvoiceId] = useState(null);

  useEffect(() => {
    // Unwrap params promise
    Promise.resolve(params).then((resolvedParams) => {
      setInvoiceId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (invoiceId) {
      // For now, redirect to edit page
      // TODO: Create a proper read-only view page
      router.replace(`/dashboard/sales/invoices/edit/${invoiceId}`);
    }
  }, [invoiceId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading invoice...</div>
    </div>
  );
}
