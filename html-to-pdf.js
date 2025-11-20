const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertHTMLToPDF() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1280, height: 720 });
    
    // Path to the HTML file
    const htmlPath = path.join(__dirname, 'DOCUMENTATION.html');
    const fileUrl = `file://${htmlPath}`;
    
    console.log('Loading HTML file...');
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    // PDF output path
    const pdfPath = path.join(__dirname, 'DOCUMENTATION.pdf');
    
    console.log('Generating PDF...');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 10px; margin-left: 20px;">Catalyst Notes App - Documentation</div>',
      footerTemplate: '<div style="font-size: 10px; margin-left: 20px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    });
    
    console.log(`✓ PDF created successfully!`);
    console.log(`  File: ${pdfPath}`);
    console.log(`  Size: ${(fs.statSync(pdfPath).size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

console.log('Starting PDF conversion...\n');
convertHTMLToPDF();
