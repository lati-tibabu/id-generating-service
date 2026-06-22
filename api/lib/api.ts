import express from 'express';
import { generateIdCardPdf } from './pdfGenerator.js';
import type { IdCardData } from './pdfGenerator.js';
import { generateEncryptedCardLink } from './encryptedLink.js';

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function parseIssuedDate(value: string): Date {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const monthYear = value.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthYear) {
    const month = Number(monthYear[1]) - 1;
    const year = Number(monthYear[2]);
    return new Date(Date.UTC(year, month, 1));
  }

  return new Date();
}

function formatExpiryDate(issueDateInput: string, expiryDate: Date): string {
  if (/^\d{1,2}\/\d{4}$/.test(issueDateInput)) {
    return `${String(expiryDate.getUTCMonth() + 1).padStart(2, '0')}/${expiryDate.getUTCFullYear()}`;
  }

  return formatDate(expiryDate);
}

function generateIdNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ID-${year}-${random}`;
}

export function normalizeIdCardData(input: Partial<IdCardData> = {}): IdCardData {
  const issuedDate = stringValue(input.issuedDate) ?? formatDate(new Date());
  const parsedIssuedDate = parseIssuedDate(issuedDate);

  return {
    name: stringValue(input.name) ?? 'John Doe',
    role: stringValue(input.role) ?? 'Card Holder',
    orgName: stringValue(input.orgName) ?? 'Acme Corporation',
    idNumber: stringValue(input.idNumber) ?? generateIdNumber(),
    email: stringValue(input.email),
    phone: stringValue(input.phone),
    bloodGroup: stringValue(input.bloodGroup),
    issuedDate,
    expiryDate: stringValue(input.expiryDate) ?? formatExpiryDate(issuedDate, addYears(parsedIssuedDate, 2)),
    photoUrl: stringValue(input.photoUrl),
    themeColor: stringValue(input.themeColor),
    themeTextColor: stringValue(input.themeTextColor),
    layout: input.layout === 'vertical' ? 'vertical' : 'horizontal',
  };
}

export function createApi() {
  const api = express.Router();

  // Middleware to support larger json payloads (e.g. base64-encoded profile photos)
  api.use(express.json({ limit: '10mb' }));
  api.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Route: Check API health
  api.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'ID Card Generator API is operational' });
  });

  // Generate a password-protected browser URL without creating or storing a PDF.
  api.post('/id-card/encrypted-link', async (req, res) => {
    try {
      const data = normalizeIdCardData(req.body);
      const forwardedProtocol = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
      const requestOrigin = `${forwardedProtocol || req.protocol}://${req.get('host')}`;
      const appUrl = process.env.PUBLIC_APP_URL?.trim() || requestOrigin;
      const credentials = await generateEncryptedCardLink(data, appUrl);

      return res.status(201).json({
        ...credentials,
        idNumber: data.idNumber,
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-HMAC-SHA256',
      });
    } catch (error: any) {
      console.error('Error generating encrypted ID-card link:', error);
      return res.status(500).json({ error: 'Failed to generate encrypted ID-card link', details: error.message });
    }
  });

  // API Route: Generate standard PDF and serve it inline
  api.post('/id-card/generate', async (req, res) => {
    try {
      const data = normalizeIdCardData(req.body);
      const pdfBuffer = await generateIdCardPdf(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `inline; filename="id-card-${data.idNumber}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      return res.status(500).json({ error: 'Failed to generate ID card PDF', details: error.message });
    }
  });

  // API Route: Generate and download the file (GET request via URL parameters)
  api.get('/id-card/download', async (req, res) => {
    try {
      const q = req.query;
      const data = normalizeIdCardData({
        name: typeof q.name === 'string' ? q.name : 'John Doe',
        role: typeof q.role === 'string' ? q.role : 'Staff Member',
        orgName: typeof q.orgName === 'string' ? q.orgName : 'Acme Corporation',
        idNumber: typeof q.idNumber === 'string' ? q.idNumber : undefined,
        email: typeof q.email === 'string' ? q.email : undefined,
        phone: typeof q.phone === 'string' ? q.phone : undefined,
        bloodGroup: typeof q.bloodGroup === 'string' ? q.bloodGroup : undefined,
        issuedDate: typeof q.issuedDate === 'string' ? q.issuedDate : undefined,
        expiryDate: typeof q.expiryDate === 'string' ? q.expiryDate : undefined,
        photoUrl: typeof q.photoUrl === 'string' ? q.photoUrl : undefined,
        themeColor: typeof q.themeColor === 'string' ? q.themeColor : undefined,
        themeTextColor: typeof q.themeTextColor === 'string' ? q.themeTextColor : undefined,
        layout: (q.layout === 'horizontal' || q.layout === 'vertical') ? q.layout : undefined,
      });

      const pdfBuffer = await generateIdCardPdf(data);
      const filename = `id-card-${data.idNumber.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(pdfBuffer);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      return res.status(500).send(`Server Error: Failed to download ID card. ${error.message}`);
    }
  });

  return api;
}
