import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, Footer } from 'docx';
import { jsPDF } from 'jspdf';

export interface DocumentExportData {
  documentType: string;
  documentText: string;
  parties?: string;
  terms?: string;
  effectiveDate?: string;
  companyName?: string;
}

/**
 * Clean and sanitize legal text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * Download document as plain text (.txt)
 */
export function downloadAsTxt(text: string, filename: string = 'legal_document.txt') {
  const clean = sanitizeText(text);
  const blob = new Blob([clean], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download formatted Word Document (.docx)
 * As detailed in LegalEase spec:
 * Includes logo/header, Times New Roman font, terms table, and professional footer.
 */
export async function downloadAsDocx(data: DocumentExportData, filename: string = 'legal_document.docx') {
  const cleanText = sanitizeText(data.documentText);
  const lines = cleanText.split('\n');

  // Parse terms into items for table
  const termsList = data.terms
    ? data.terms.split(';').map(t => t.trim()).filter(Boolean)
    : [];

  const paragraphs: (Paragraph | Table)[] = [];

  // LegalEase Header / Branding
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: '⚖️ LegalEase',
          bold: true,
          size: 32, // 16pt
          font: 'Times New Roman',
          color: '1A365D',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: 'AI Legal Document Generator',
          italics: true,
          size: 20, // 10pt
          font: 'Times New Roman',
          color: '4A5568',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: data.documentType.toUpperCase(),
          bold: true,
          size: 36, // 18pt
          font: 'Times New Roman',
          underline: {},
        }),
      ],
    })
  );

  // Process document text lines into DOCX paragraphs
  let inSignatureBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: '', font: 'Times New Roman' })],
        })
      );
      continue;
    }

    // Skip duplicate markdown header if it matches document type
    if (line.startsWith('##') || line.startsWith('#')) {
      const headingText = line.replace(/^#+\s*/, '');
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: headingText,
              bold: true,
              size: 26, // 13pt
              font: 'Times New Roman',
              color: '1A202C',
            }),
          ],
        })
      );
      continue;
    }

    // Bold section headings like "1. Services:", "WITNESSETH:", "Between:"
    if (/^(\d+\.|\bWITNESSETH\b|\bNOW, THEREFORE\b|\bBetween:\b|\bAnd:\b|\bIN WITNESS WHEREOF\b)/i.test(line)) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 180, after: 100 },
          children: [
            new TextRun({
              text: line,
              bold: true,
              size: 24, // 12pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
      continue;
    }

    // Terms or bullet points
    if (line.startsWith('- ') || line.startsWith('* ') || /^[a-z]\)/.test(line)) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: line.replace(/^[-*]\s*/, ''),
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
      continue;
    }

    // Standard paragraph
    paragraphs.push(
      new Paragraph({
        spacing: { after: 140, line: 276 }, // 1.15 line spacing
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: line,
            size: 24, // 12pt
            font: 'Times New Roman',
          }),
        ],
      })
    );
  }

  // If user provided specific terms, auto-generate the Terms Table (as noted on page 9 & 15 of spec)
  if (termsList.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: 'Schedule A: Summary of Agreed Terms & Conditions',
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Clause', bold: true, font: 'Times New Roman' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Agreed Provision & Term', bold: true, font: 'Times New Roman' })],
              }),
            ],
          }),
        ],
      }),
      ...termsList.map((term, index) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `Term ${index + 1}`, bold: true, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 85, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: term, font: 'Times New Roman' })],
                }),
              ],
            }),
          ],
        })
      ),
    ];

    paragraphs.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  // Build the complete docx document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'LegalEase Inc. | contact@legalease.com | All Rights Reserved',
                    size: 18, // 9pt
                    font: 'Times New Roman',
                    color: '718096',
                  }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download formatted PDF (.pdf)
 * As detailed in LegalEase spec:
 * Center-aligned logo/header, bold headings for sections, bullet-style terms,
 * and professional footer on every page.
 */
export function downloadAsPdf(data: DocumentExportData, filename: string = 'legal_document.pdf') {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
  });

  const cleanText = sanitizeText(data.documentText);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54; // 0.75 inch
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 50;

  let y = margin;

  const addHeaderAndFooter = (pageNumber: number, totalPagesPlaceholder: boolean = false) => {
    // Header
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(26, 54, 93);
    doc.text('LegalEase', pageWidth / 2, 32, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(113, 128, 150);
    doc.text('AI Legal Document Generator', pageWidth / 2, 43, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, 48, pageWidth - margin, 48);

    // Footer
    doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 128, 150);
    doc.text(
      'LegalEase Inc. | contact@legalease.com | All Rights Reserved',
      margin,
      pageHeight - 22
    );
    doc.text(
      `Page ${pageNumber}`,
      pageWidth - margin,
      pageHeight - 22,
      { align: 'right' }
    );
  };

  let pageNum = 1;
  addHeaderAndFooter(pageNum);
  y = 65;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text(data.documentType.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 24;

  const lines = cleanText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check page overflow
    if (y > pageHeight - bottomMargin) {
      doc.addPage();
      pageNum++;
      addHeaderAndFooter(pageNum);
      y = 65;
    }

    if (!line) {
      y += 8;
      continue;
    }

    // Heading lines
    if (line.startsWith('#') || /^(\d+\.|\bWITNESSETH\b|\bNOW, THEREFORE\b|\bBetween:\b|\bAnd:\b|\bIN WITNESS WHEREOF\b)/i.test(line)) {
      const heading = line.replace(/^#+\s*/, '');
      y += 8;
      if (y > pageHeight - bottomMargin) {
        doc.addPage();
        pageNum++;
        addHeaderAndFooter(pageNum);
        y = 65;
      }

      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);

      const splitHead = doc.splitTextToSize(heading, contentWidth);
      doc.text(splitHead, margin, y);
      y += splitHead.length * 14;
      continue;
    }

    // Bullet lines
    if (line.startsWith('- ') || line.startsWith('* ') || /^[a-z]\)/.test(line)) {
      const bulletText = line.replace(/^[-*]\s*/, '');
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(45, 55, 72);

      const splitBullet = doc.splitTextToSize(`•  ${bulletText}`, contentWidth - 12);
      doc.text(splitBullet, margin + 12, y);
      y += splitBullet.length * 13;
      continue;
    }

    // Signature lines
    if (line.startsWith('____') || line.includes('Authorized Signature:') || line.includes('Date:')) {
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(55, 65, 81);
      doc.text(line, margin, y);
      y += 14;
      continue;
    }

    // Standard body text
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);

    const splitText = doc.splitTextToSize(line, contentWidth);
    doc.text(splitText, margin, y);
    y += splitText.length * 13.5;
  }

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(safeFilename);
}
