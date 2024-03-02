const PDFDocument = require('pdfkit');

const generatePDF = () => {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      doc.fontSize(25).text('Por favor funcioná', 100, 100);
      doc.end();
    });
  };

module.exports = {
    generatePDF
};