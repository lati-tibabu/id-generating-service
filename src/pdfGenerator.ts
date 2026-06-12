import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export interface IdCardData {
  name: string;
  role: string;
  orgName: string;
  idNumber: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  issuedDate?: string;
  expiryDate?: string;
  photoUrl?: string; // Image URL (http/https) or base64 data string (data:image/jpeg;base64,...)
  themeColor?: string; // Hex color code e.g., #2563EB
  themeTextColor?: string; // Hex color code e.g., #FFFFFF for header text
  layout?: 'vertical' | 'horizontal'; // CR80 style proportions
}

/**
 * Helper to fetch an image or convert a base64 string into a Buffer for PDFKit
 */
async function getImageBuffer(photoInput: string): Promise<Buffer | null> {
  if (!photoInput) return null;

  try {
    // 1. Handle base64
    if (photoInput.startsWith('data:image')) {
      const base64Data = photoInput.split(';base64,').pop();
      if (base64Data) {
        return Buffer.from(base64Data, 'base64');
      }
    }

    // 2. Handle HTTP/HTTPS URLs
    if (photoInput.startsWith('http://') || photoInput.startsWith('https://')) {
      const response = await fetch(photoInput, { signal: AbortSignal.timeout(4000) });
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    return null;
  } catch (error) {
    console.error('Failed to load ID card photo buffer:', error);
    return null;
  }
}

/**
 * Draws a dummy 1D barcode at the specified coordinates
 */
function drawBarcode(doc: typeof PDFDocument, x: number, y: number, width: number, height: number) {
  doc.save();
  
  // Outer border or frame (optional, let's keep it clean)
  // Draw randomized alternating bars
  const totalBars = 32;
  let currentX = x;
  const barSpacing = width / totalBars;

  // Static random sequence for consistent look
  const barPatterns = [
    1, 2, 1, 3, 1, 2, 4, 1, 2, 2, 1, 3, 1, 4, 1, 2,
    2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 3
  ];

  for (let i = 0; i < totalBars; i++) {
    const barWeight = (barPatterns[i % barPatterns.length] || 1) * 0.45;
    if (i % 2 === 0) {
      doc.rect(currentX, y, barSpacing * barWeight, height)
         .fill('#111827');
    }
    currentX += barSpacing;
  }

  doc.restore();
}

/**
 * Draws a mock QR code/Security key pattern using simple micro rects
 */
function drawSecurityGrid(doc: typeof PDFDocument, x: number, y: number, size: number) {
  doc.save();
  const squareSize = size / 8;
  // A static pseudo-QR pattern
  const pattern = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1],
    [1,0,1,1,0,0,1,1],
    [1,0,0,0,1,0,1,0],
    [1,0,1,0,0,1,1,1],
    [1,0,0,1,1,0,0,1],
    [1,1,1,1,1,1,1,1]
  ];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (pattern[r][c] === 1) {
        doc.rect(x + c * squareSize, y + r * squareSize, squareSize, squareSize)
           .fill('#111827');
      }
    }
  }
  doc.restore();
}

/**
 * Generates the PDF Document and returns it as a Buffer
 */
export async function generateIdCardPdf(data: IdCardData): Promise<Buffer> {
  const {
    name = 'John Doe',
    role = 'Card Holder',
    orgName = 'Acme Corporation',
    idNumber = 'EMP-001928',
    email = 'john.doe@company.com',
    phone = '+1 (555) 123-4567',
    bloodGroup = 'O+',
    issuedDate = '06/2026',
    expiryDate = '06/2031',
    photoUrl = '',
    themeColor = '#3B82F6',
    themeTextColor = '#FFFFFF',
    layout = 'vertical',
  } = data;

  // Credit Card Proportions at higher-fidelity size (rounded aspect ratio 1:1.6)
  const isVertical = layout === 'vertical';
  const width = isVertical ? 300 : 480;
  const height = isVertical ? 480 : 300;

  // Create PDF Document (multiple pages: Page 1 Front, Page 2 Back)
  const doc = new PDFDocument({
    size: [width, height],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: false,
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Try fetching the profile photo if available
  const imgBuffer = photoUrl ? await getImageBuffer(photoUrl) : null;

  // --- PAGE 1: FRONT SIDE ---
  doc.addPage();

  // Draw rounded card border
  const cornerRadius = 14;
  doc.save();
  doc.roundedRect(4, 4, width - 8, height - 8, cornerRadius)
     .lineWidth(1.5)
     .stroke('#E5E7EB');
  doc.restore();

  if (isVertical) {
    // 1. VERTICAL CARD LAYOUT

    // Top Header Banner
    const bannerHeight = 125;
    doc.save();
    // Clip to rounded border so the banner doesn't spill over corners
    doc.roundedRect(4, 4, width - 8, height - 8, cornerRadius).clip();
    
    // Header fill
    doc.rect(4, 4, width - 8, bannerHeight)
       .fill(themeColor);

    // Subtle background mesh/lines accent in the banner
    doc.opacity(0.12)
       .lineWidth(1)
       .moveTo(10, 10).lineTo(width - 10, bannerHeight - 20)
       .moveTo(width - 50, 10).lineTo(20, bannerHeight - 10)
       .moveTo(10, 80).lineTo(width - 10, 30)
       .stroke(themeTextColor);
    doc.restore();

    // Org Name Header Text
    doc.fillColor(themeTextColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(orgName.toUpperCase(), 12, 18, {
         width: width - 24,
         align: 'center',
         lineGap: 2,
       });

    doc.fillColor(themeTextColor)
       .font('Helvetica')
       .fontSize(7)
       .opacity(0.75)
       .text('SECURE IDENTIFICATION', 12, 38, {
         width: width - 24,
         align: 'center',
         characterSpacing: 1.5
       });

    // Profile photo circle (clipped)
    const avatarX = 150;
    const avatarY = 125;
    const avatarRadius = 46;

    // Draw white shadow ring for avatar
    doc.save()
       .circle(avatarX, avatarY, avatarRadius + 3)
       .fill('#FFFFFF');

    // Avatar container background
    doc.save()
       .circle(avatarX, avatarY, avatarRadius)
       .fill('#F3F4F6');

    if (imgBuffer) {
      // Draw actual photo inside the circle using clipping
      try {
        doc.save()
           .circle(avatarX, avatarY, avatarRadius)
           .clip()
           .image(imgBuffer, avatarX - avatarRadius, avatarY - avatarRadius, {
             width: avatarRadius * 2,
             height: avatarRadius * 2,
           })
           .restore();
      } catch (err) {
        // Safe fallback in case the image load was corrupted
        drawFallbackAvatar(doc, avatarX, avatarY, avatarRadius, name, themeColor);
      }
    } else {
      drawFallbackAvatar(doc, avatarX, avatarY, avatarRadius, name, themeColor);
    }

    // Name & Designation Panel
    doc.fillColor('#111827')
       .font('Helvetica-Bold')
       .fontSize(18)
       .text(name, 12, 182, {
         width: width - 24,
         align: 'center',
       });

    doc.fillColor(themeColor)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(role.toUpperCase(), 12, 204, {
         width: width - 24,
         align: 'center',
         characterSpacing: 1,
       });

    // Divider
    doc.strokeColor('#E5E7EB')
       .lineWidth(1)
       .moveTo(35, 222).lineTo(width - 35, 222)
       .stroke();

    // Information Grid / Rows
    const infoY = 232;
    const rowHeight = 21;
    let currentRow = 0;

    const addInfoRow = (label: string, value: string) => {
      const currentY = infoY + (currentRow * rowHeight);
      
      // Label
      doc.fillColor('#6B7280')
         .font('Helvetica-Bold')
         .fontSize(7.5)
         .text(label.toUpperCase(), 35, currentY, { width: 85, align: 'left' });

      // Value
      doc.fillColor('#1F2937')
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(value, 115, currentY - 1, { width: 150, align: 'left' });

      // Horizontal subtle line
      doc.save()
         .strokeColor('#F3F4F6')
         .lineWidth(0.5)
         .moveTo(35, currentY + 15).lineTo(width - 35, currentY + 15)
         .stroke()
         .restore();

      currentRow++;
    };

    addInfoRow('ID Number', idNumber);
    if (email) addInfoRow('Email', email);
    if (phone) addInfoRow('Phone', phone);
    if (bloodGroup) addInfoRow('Blood Group', bloodGroup);
    
    // Double details in one row for Dates
    const footerY = 368;
    doc.fillColor('#6B7280')
       .font('Helvetica-Bold')
       .fontSize(7)
       .text('ISSUED', 35, footerY);
    doc.fillColor('#1F2937')
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(issuedDate, 35, footerY + 10);

    doc.fillColor('#6B7280')
       .font('Helvetica-Bold')
       .fontSize(7)
       .text('EXPIRY', 105, footerY);
    doc.fillColor('#B91C1C') // Red for expiry alert
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(expiryDate, 105, footerY + 10);

    // Decorative Hologram stamp
    doc.save();
    const holoX = width - 65;
    const holoY = footerY - 5;
    doc.circle(holoX + 15, holoY + 15, 16)
       .strokeColor('#E5E7EB')
       .lineWidth(1)
       .stroke();
    // Shiny gold gradient representation
    doc.circle(holoX + 15, holoY + 15, 14)
       .fillColor('#FEF3C7')
       .fill();
    doc.circle(holoX + 15, holoY + 15, 11)
       .fillColor('#FCD34D')
       .fill();
    doc.fillColor('#D97706')
       .font('Helvetica-Bold')
       .fontSize(5)
       .text('VALID', holoX + 3, holoY + 13, { width: 24, align: 'center' });
    doc.restore();

    // Barcode at the very bottom
    const barcodeWidth = 180;
    const barcodeHeight = 28;
    const barcodeX = (width - barcodeWidth) / 2;
    const barcodeY = height - 52;
    drawBarcode(doc, barcodeX, barcodeY, barcodeWidth, barcodeHeight);

    // Barcode textual print
    doc.fillColor('#4B5563')
       .font('Courier-Bold')
       .fontSize(7.5)
       .text(`* ${idNumber.toUpperCase()} *`, 12, height - 20, {
         width: width - 24,
         align: 'center',
         characterSpacing: 1.2
       });

  } else {
    // 2. HORIZONTAL CARD LAYOUT
    doc.save();
    doc.roundedRect(4, 4, width - 8, height - 8, cornerRadius).clip();

    // Left Column Filled Accent
    const sidebarWidth = 145;
    doc.rect(4, 4, sidebarWidth, height - 8)
       .fill(themeColor);

    // Subtle background mesh in sidebar
    doc.opacity(0.12)
       .lineWidth(1)
       .moveTo(10, 10).lineTo(sidebarWidth - 10, height - 20)
       .moveTo(sidebarWidth - 20, 10).lineTo(20, height - 10)
       .stroke(themeTextColor);
    doc.restore();

    // Org Name in Left Sidebar
    doc.fillColor(themeTextColor)
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(orgName.toUpperCase(), 8, 18, {
         width: sidebarWidth,
         align: 'center',
       });

    doc.fillColor(themeTextColor)
       .font('Helvetica')
       .fontSize(5.5)
       .opacity(0.75)
       .text('SECURE IDENTITY', 8, 31, {
         width: sidebarWidth,
         align: 'center',
         characterSpacing: 1
       });

    // Profile photo circle inside Left Sidebar
    const avatarX = 4 + (sidebarWidth / 2);
    const avatarY = height / 2 + 10;
    const avatarRadius = 38;

    // Outer thick white circle
    doc.save()
       .circle(avatarX, avatarY, avatarRadius + 3)
       .fill('#FFFFFF');

    doc.save()
       .circle(avatarX, avatarY, avatarRadius)
       .fill('#F3F4F6');

    if (imgBuffer) {
      try {
        doc.save()
           .circle(avatarX, avatarY, avatarRadius)
           .clip()
           .image(imgBuffer, avatarX - avatarRadius, avatarY - avatarRadius, {
             width: avatarRadius * 2,
             height: avatarRadius * 2,
           })
           .restore();
      } catch (err) {
        drawFallbackAvatar(doc, avatarX, avatarY, avatarRadius, name, themeColor);
      }
    } else {
      drawFallbackAvatar(doc, avatarX, avatarY, avatarRadius, name, themeColor);
    }

    // Right Column Information Layout (Starts at x: 165)
    // Name
    doc.fillColor('#111827')
       .font('Helvetica-Bold')
       .fontSize(19)
       .text(name, 165, 20, { width: width - 180 });

    // Designation
    doc.fillColor(themeColor)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(role.toUpperCase(), 165, 42, {
         width: width - 180,
         characterSpacing: 0.8
       });

    // Separation line
    doc.strokeColor('#E5E7EB')
       .lineWidth(1)
       .moveTo(165, 58).lineTo(width - 24, 58)
       .stroke();

    // Rows of info
    const labelX = 165;
    const valX = 245;
    const startY = 70;
    const lineRowHeight = 19;
    let rIdx = 0;

    const drawHorizontalRow = (l: string, v: string) => {
      const curY = startY + (rIdx * lineRowHeight);
      doc.fillColor('#6B7280')
         .font('Helvetica-Bold')
         .fontSize(7.2)
         .text(l.toUpperCase(), labelX, curY);

      doc.fillColor('#1F2937')
         .font('Helvetica-Bold')
         .fontSize(8.5)
         .text(v, valX, curY - 0.5);

      doc.strokeColor('#F3F4F6')
         .lineWidth(0.5)
         .moveTo(labelX, curY + 13).lineTo(width - 24, curY + 13)
         .stroke();

      rIdx++;
    };

    drawHorizontalRow('ID Number', idNumber);
    if (email) drawHorizontalRow('Email', email);
    if (phone) drawHorizontalRow('Phone', phone);
    if (bloodGroup) drawHorizontalRow('Blood Type', bloodGroup);

    // Bottom horizontal details: Dates and barcode side-by-side
    const bottomY = 175;
    
    // Issued / Expiry
    doc.fillColor('#6B7280')
       .font('Helvetica-Bold')
       .fontSize(7)
       .text('ISSUED', 165, bottomY);
    doc.fillColor('#1F2937')
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(issuedDate, 165, bottomY + 10);

    doc.fillColor('#6B7280')
       .font('Helvetica-Bold')
       .fontSize(7)
       .text('EXPIRY', 225, bottomY);
    doc.fillColor('#B91C1C')
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(expiryDate, 225, bottomY + 10);

    // High quality security Hologram
    const holoX = 290;
    const holoY = bottomY - 2;
    doc.save()
       .circle(holoX + 11, holoY + 11, 13)
       .fillColor('#FEF3C7')
       .strokeColor('#D97706')
       .lineWidth(0.5)
       .stroke()
       .fill()
       .circle(holoX + 11, holoY + 11, 9)
       .fillColor('#FCD34D')
       .fill()
       .restore();

    // Barcode on the right bottom
    const barcodeWidth = 115;
    const barcodeHeight = 22;
    const barcodeX = width - barcodeWidth - 18;
    const barcodeY = bottomY - 3;
    drawBarcode(doc, barcodeX, barcodeY, barcodeWidth, barcodeHeight);

    doc.fillColor('#4B5563')
       .font('Courier-Bold')
       .fontSize(7)
       .text(`* ${idNumber.toUpperCase()} *`, barcodeX, barcodeY + barcode6CodeOffset(barcodeHeight), {
         width: barcodeWidth,
         align: 'center',
         characterSpacing: 0.5
       });
  }

  // Helper inside text offsets
  function barcode6CodeOffset(h: number) {
    return h + 4;
  }

  // --- PAGE 2: BACK SIDE OF THE CARD ---
  doc.addPage();

  // Draw identical rounded card border
  doc.save();
  doc.roundedRect(4, 4, width - 8, height - 8, cornerRadius)
     .lineWidth(1.5)
     .stroke('#9CA3AF');
  doc.restore();

  // Draw high fidelity dark Magnetic Stripe at the top
  const stripeY = isVertical ? 24 : 16;
  const stripeHeight = isVertical ? 38 : 34;
  doc.save();
  doc.roundedRect(4, 4, width - 8, height - 8, cornerRadius).clip();
  doc.rect(4, stripeY, width - 8, stripeHeight)
     .fill('#1F2937'); // Charcoal magnetic stripe
  doc.restore();

  if (isVertical) {
    // Return Instructions / Legal Text
    const contentY = stripeY + stripeHeight + 22;
    
    doc.fillColor('#1F2937')
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text('TERMS AND CONDITIONS', 24, contentY, { align: 'center', width: width - 48 });

    const instructionsText = 
      "1. This card is proprietary to the issuing organization and is non-transferable.\n\n" +
      "2. It must be prominently displayed at all times while on the organization's premises.\n\n" +
      "3. In the event of loss or theft, report immediately to the administration office.\n\n" +
      "4. Safe keeping and maintenance is the direct responsibility of the cardholder.";

    doc.fillColor('#4B5563')
       .font('Helvetica')
       .fontSize(7)
       .text(instructionsText, 24, contentY + 20, {
         width: width - 48,
         align: 'justify',
         lineGap: 4
       });

    // Middle Divider
    doc.strokeColor('#E5E7EB')
       .lineWidth(1.5)
       .moveTo(40, contentY + 125).lineTo(width - 40, contentY + 125)
       .stroke();

    // Return to instructions
    doc.fillColor('#111827')
       .font('Helvetica-Bold')
       .fontSize(8)
       .text('IF FOUND, PLEASE RETURN TO:', 24, contentY + 140, { align: 'center', width: width - 48 });

    doc.fillColor('#4B5563')
       .font('Helvetica')
       .fontSize(7.5)
       .text(`${orgName}\nSecurity & Facilities Dept.\nAdmin HQ Office block, Suite 4A`, 24, contentY + 155, {
         align: 'center',
         width: width - 48,
         lineGap: 2
       });

    // Signature Area at the bottom
    const sigY = height - 80;
    doc.strokeColor('#9CA3AF')
       .lineWidth(0.8)
       .dash(3, { space: 2 })
       .moveTo(50, sigY).lineTo(width - 50, sigY)
       .stroke();
    doc.undash();

    doc.fillColor('#4B5563')
       .font('Helvetica-Bold')
       .fontSize(6.5)
       .text('AUTHORIZED SIGNATURE', 24, sigY + 6, { align: 'center', width: width - 48 });

    // QR Code / holographic visual indicator next to signature
    const qrSize = 34;
    drawSecurityGrid(doc, width - qrSize - 18, sigY - 26, qrSize);

  } else {
    // Horizontal details
    const contentLeft = 24;
    const contentWidth = 260;
    const rightColLeft = 300;
    const rightColWidth = 156;

    const contentY = stripeY + stripeHeight + 15;

    // Left Column return info & legal
    doc.fillColor('#1F2937')
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text('ID CARD POLICY', contentLeft, contentY);

    const instructionsText = 
      "• Property of the issuing organization. Must be surrendered upon termination.\n" +
      "• If found, return via mail or directly to the Security & Facilities HQ.\n" +
      "• Safeguard card at all times. Use cardholder portals to request standard reissue.";

    doc.fillColor('#4B5563')
       .font('Helvetica')
       .fontSize(6.8)
       .text(instructionsText, contentLeft, contentY + 15, {
         width: contentWidth,
         lineGap: 4
       });

    doc.fillColor('#111827')
       .font('Helvetica-Bold')
       .fontSize(7.5)
       .text('RETURN ADDRESS:', contentLeft, contentY + 70);

    doc.fillColor('#4B5563')
       .font('Helvetica')
       .fontSize(7)
       .text(`${orgName}, Administration & Security Office block, London EC1A`, contentLeft, contentY + 81, {
         width: contentWidth
       });

    // Right Column: Signature and holographic security
    const rightY = contentY;

    // Security QR grid
    doc.fillColor('#1F2937')
       .font('Helvetica-Bold')
       .fontSize(7.5)
       .text('SYSTEM AUTH', rightColLeft, rightY);
       
    const qrSize = 40;
    drawSecurityGrid(doc, rightColLeft, rightY + 12, qrSize);

    // Signature line
    const sigX = rightColLeft;
    const sigY = height - 50;
    
    doc.strokeColor('#9CA3AF')
       .lineWidth(0.8)
       .dash(3, { space: 2 })
       .moveTo(sigX, sigY).lineTo(width - 24, sigY)
       .stroke();
    doc.undash();

    doc.fillColor('#4B5563')
       .font('Helvetica-Bold')
       .fontSize(6)
       .text('AUTHORIZED SECURITY SIGNATURE', sigX, sigY + 6, {
         width: width - sigX - 24,
         align: 'center'
       });
  }

  // End and flush stream
  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Draws a gorgeous geometric fallback avatar when no custom profile photo is loaded
 */
function drawFallbackAvatar(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  radius: number,
  name: string,
  themeColor: string
) {
  doc.save();

  // Create crisp geometric gradient representation
  doc.circle(x, y, radius)
     .fillColor(themeColor)
     .opacity(0.12)
     .fill();

  // Circle inner border
  doc.circle(x, y, radius)
     .strokeColor(themeColor)
     .lineWidth(1)
     .opacity(0.3)
     .stroke();

  // Draw stylish inner target or lines
  doc.opacity(0.2)
     .lineWidth(0.5)
     .circle(x, y, radius * 0.72).stroke()
     .circle(x, y, radius * 0.45).stroke();

  // Extract initials
  const parts = name.trim().split(/\s+/);
  let initials = '?';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = parts[0].substring(0, 2).toUpperCase();
  }

  // Draw initials in center
  doc.opacity(0.9)
     .fillColor(themeColor)
     .font('Helvetica-Bold')
     .fontSize(radius * 0.6)
     .text(initials, x - radius, y - (radius * 0.3), {
       width: radius * 2,
       align: 'center'
     });

  doc.restore();
}
