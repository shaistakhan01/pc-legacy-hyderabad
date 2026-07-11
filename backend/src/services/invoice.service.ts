import PDFDocument from "pdfkit";

export function generateInvoicePdf(booking: {
  reference_number: string;
  module_type: string;
  total_amount: number;
  created_at: string;
  status: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("PC Legacy Hyderabad", { align: "center" });
    doc.fontSize(12).text("Booking Invoice", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(11);
    doc.text(`Reference Number: ${booking.reference_number}`);
    doc.text(`Booking Type: ${booking.module_type}`);
    doc.text(`Booking Date: ${new Date(booking.created_at).toLocaleDateString()}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: ₹${booking.total_amount}`, { underline: true });
    doc.moveDown(2);

    doc.fontSize(9).fillColor("gray").text(
      "This is a computer-generated invoice and does not require a signature.",
      { align: "center" }
    );

    doc.end();
  });
}