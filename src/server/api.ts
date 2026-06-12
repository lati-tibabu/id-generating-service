import express from 'express';
import { generateIdCardPdf, IdCardData } from '../pdfGenerator';

export function createApi() {
  const api = express.Router();

  // Middleware to support larger json payloads (e.g. base64-encoded profile photos)
  api.use(express.json({ limit: '10mb' }));
  api.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Route: Check API health
  api.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'ID Card Generator API is operational' });
  });

  // API Route: Generate standard PDF and serve it inline
  api.post('/id-card/generate', async (req, res) => {
    try {
      const data: IdCardData = req.body;
      const pdfBuffer = await generateIdCardPdf(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `inline; filename="id-card-${data.idNumber || 'holder'}.pdf"`);
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
      const data: IdCardData = {
        name: typeof q.name === 'string' ? q.name : 'John Doe',
        role: typeof q.role === 'string' ? q.role : 'Staff Member',
        orgName: typeof q.orgName === 'string' ? q.orgName : 'Acme Corporation',
        idNumber: typeof q.idNumber === 'string' ? q.idNumber : 'EMP-2026-9483',
        email: typeof q.email === 'string' ? q.email : undefined,
        phone: typeof q.phone === 'string' ? q.phone : undefined,
        bloodGroup: typeof q.bloodGroup === 'string' ? q.bloodGroup : undefined,
        issuedDate: typeof q.issuedDate === 'string' ? q.issuedDate : undefined,
        expiryDate: typeof q.expiryDate === 'string' ? q.expiryDate : undefined,
        photoUrl: typeof q.photoUrl === 'string' ? q.photoUrl : undefined,
        themeColor: typeof q.themeColor === 'string' ? q.themeColor : undefined,
        themeTextColor: typeof q.themeTextColor === 'string' ? q.themeTextColor : undefined,
        layout: (q.layout === 'horizontal' || q.layout === 'vertical') ? q.layout : 'vertical',
      };

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
