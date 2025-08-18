import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePdf = (paymentDetails) => {
  const { plan, tier, payment, user } = paymentDetails;
  
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('Invoice', 14, 22);
  doc.setFontSize(12);
  doc.text(`Invoice #: ${payment.invoiceId}`, 14, 32);
  doc.text(`Payment ID: ${payment.razorpayPaymentId}`, 14, 38);
  doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 14, 44);

  // Add client and company details
  doc.text('Billed To:', 14, 60);
  doc.text(user?.fullName || 'N/A', 14, 66);
  doc.text(user?.email || 'N/A', 14, 72);
  
  doc.text('From:', 150, 60);
  doc.text('Edvixo', 150, 66);
  doc.text('your.email@example.com', 150, 72);

  // Add table with invoice details
  const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
  const tableRows = [];

  const rowData = [
    `${plan.name} - ${tier.name} Plan`,
    1,
    `${payment.currency} ${payment.amount}`,
    `${payment.currency} ${payment.amount}`
  ];
  tableRows.push(rowData);

  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
  });

  // Add total
  const finalY = doc.lastAutoTable.finalY;
  doc.setFontSize(14);
  doc.text('Total Amount:', 14, finalY + 10);
  doc.text(`${payment.currency} ${payment.amount}`, 150, finalY + 10);

  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 14, doc.internal.pageSize.height - 10);

  // Save the PDF
  doc.save(`invoice-${payment.invoiceId}.pdf`);
};
