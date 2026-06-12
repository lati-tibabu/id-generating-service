import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateIdCardPdf, IdCardData } from './src/pdfGenerator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support larger json payloads (e.g. base64-encoded profile photos)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Route: Check API health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ID Card Generator API is operational' });
  });

  // API Route: Generate standard PDF and serve it inline (useful for in-browser viewing or standard PDF preview)
  app.post('/api/id-card/generate', async (req, res) => {
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
  // When a user clicks a standard link, this browser-friendly GET route starts the download immediately.
  app.get('/api/id-card/download', async (req, res) => {
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

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
    console.log(`Environment mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Critical server startup failure:', err);
});
