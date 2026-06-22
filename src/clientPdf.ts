import { jsPDF } from 'jspdf';
import type { ClientIdCardData } from './cardData';

const safe = (value: string | undefined, fallback = '—') => value || fallback;

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function drawFront(doc: jsPDF, data: ClientIdCardData, width: number, height: number) {
  const vertical = data.layout === 'vertical';
  doc.setFillColor('#FFFFFF');
  doc.roundedRect(4, 4, width - 8, height - 8, 14, 14, 'F');
  doc.setFillColor(data.themeColor);
  doc.roundedRect(4, 4, width - 8, vertical ? 125 : 72, 14, 14, 'F');
  doc.rect(4, vertical ? 58 : 40, width - 8, vertical ? 71 : 32, 'F');

  doc.setTextColor(data.themeTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(vertical ? 14 : 16);
  doc.text(data.orgName.toUpperCase(), vertical ? width / 2 : 25, vertical ? 25 : 32, {
    align: vertical ? 'center' : 'left', maxWidth: vertical ? width - 30 : width - 50,
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('SECURE IDENTIFICATION', vertical ? width / 2 : 25, vertical ? 43 : 48, { align: vertical ? 'center' : 'left' });

  const avatarX = vertical ? width / 2 : 92;
  const avatarY = vertical ? 126 : 143;
  const avatarR = vertical ? 45 : 51;
  doc.setFillColor('#F1F5F9');
  doc.setDrawColor('#FFFFFF');
  doc.setLineWidth(5);
  doc.circle(avatarX, avatarY, avatarR, 'FD');
  doc.setTextColor(data.themeColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(vertical ? 28 : 32);
  doc.text(initials(data.name), avatarX, avatarY + 10, { align: 'center' });

  const textX = vertical ? width / 2 : 170;
  const textY = vertical ? 196 : 112;
  doc.setTextColor('#111827');
  doc.setFontSize(vertical ? 18 : 21);
  doc.text(data.name, textX, textY, { align: vertical ? 'center' : 'left', maxWidth: vertical ? width - 28 : width - textX - 25 });
  doc.setTextColor(data.themeColor);
  doc.setFontSize(9);
  doc.text(data.role.toUpperCase(), textX, textY + 19, { align: vertical ? 'center' : 'left' });

  const infoX = vertical ? 35 : 170;
  const infoY = vertical ? 250 : 166;
  const rows: Array<[string, string]> = [
    ['ID NUMBER', data.idNumber],
    ['BLOOD GROUP', safe(data.bloodGroup)],
    ['VALID UNTIL', data.expiryDate],
  ];
  rows.forEach(([label, value], index) => {
    const y = infoY + index * (vertical ? 40 : 31);
    doc.setTextColor('#94A3B8'); doc.setFontSize(6.5); doc.text(label, infoX, y);
    doc.setTextColor('#1E293B'); doc.setFontSize(10); doc.text(value, infoX, y + 12);
  });

  doc.setDrawColor('#E2E8F0'); doc.setLineWidth(1); doc.roundedRect(4, 4, width - 8, height - 8, 14, 14, 'S');
}

function drawBack(doc: jsPDF, data: ClientIdCardData, width: number, height: number) {
  doc.setFillColor('#FFFFFF'); doc.roundedRect(4, 4, width - 8, height - 8, 14, 14, 'F');
  doc.setFillColor(data.themeColor); doc.roundedRect(4, 4, width - 8, 48, 14, 14, 'F'); doc.rect(4, 28, width - 8, 24, 'F');
  doc.setTextColor(data.themeTextColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('CARD HOLDER INFORMATION', 24, 31);
  const rows: Array<[string, string]> = [
    ['ORGANIZATION', data.orgName], ['EMAIL', safe(data.email)], ['PHONE', safe(data.phone)],
    ['ISSUED', data.issuedDate], ['EXPIRES', data.expiryDate],
  ];
  rows.forEach(([label, value], index) => {
    const y = 82 + index * 30;
    doc.setTextColor('#94A3B8'); doc.setFontSize(6.5); doc.text(label, 26, y);
    doc.setTextColor('#1E293B'); doc.setFontSize(9); doc.text(value, 26, y + 11, { maxWidth: width - 52 });
  });
  doc.setFillColor('#0F172A');
  for (let i = 0; i < 38; i += 1) if ((i * 7) % 5 !== 0) doc.rect(width - 155 + i * 3, height - 49, i % 3 === 0 ? 2 : 1, 27, 'F');
  doc.setTextColor('#64748B'); doc.setFontSize(6.5); doc.text(data.idNumber, width - 98, height - 14, { align: 'center' });
  doc.setDrawColor('#E2E8F0'); doc.roundedRect(4, 4, width - 8, height - 8, 14, 14, 'S');
}

export async function downloadIdCardPdf(data: ClientIdCardData) {
  const width = data.layout === 'vertical' ? 300 : 480;
  const height = data.layout === 'vertical' ? 480 : 300;
  const doc = new jsPDF({ unit: 'pt', format: [width, height], orientation: width > height ? 'landscape' : 'portrait', compress: true });
  drawFront(doc, data, width, height);
  doc.addPage([width, height], width > height ? 'landscape' : 'portrait');
  drawBack(doc, data, width, height);
  const filename = `id-card-${data.idNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
  doc.save(filename);
}
