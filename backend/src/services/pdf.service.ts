import puppeteer from 'puppeteer';
import { prisma } from '../config/database';
import { storageService } from './storage.service';
import { logger } from '../config/logger';

export const pdfService = {
  async generateProposalPdf(proposalId: string): Promise<string> {
    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId }, include: { client: true } });
    if (!proposal) throw new Error('Proposal not found');

    const html = buildProposalHtml(proposal);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
      const key = `pdfs/${proposalId}/${Date.now()}.pdf`;
      const pdfUrl = await storageService.uploadBuffer(pdfBuffer, key, 'application/pdf');
      await prisma.proposal.update({ where: { id: proposalId }, data: { pdfUrl, pdfGeneratedAt: new Date() } });
      logger.info('PDF generated', { proposalId, key });
      return pdfUrl;
    } finally {
      await browser.close();
    }
  },
};

function buildProposalHtml(proposal: any): string {
  const pricing = (proposal.pricingTable as any[]) || [];
  const timeline = (proposal.timeline as any[]) || [];
  const total = pricing.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${proposal.title}</title><style>body{font-family:system-ui,sans-serif;color:#1a1a2e;line-height:1.7;}.cover{min-height:100vh;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;text-align:center;padding:60px;page-break-after:always;}h2{font-size:28px;font-weight:700;color:#6366f1;margin-bottom:24px;}table{width:100%;border-collapse:collapse;}th{background:#6366f1;color:white;padding:14px;text-align:left;}td{padding:12px;border-bottom:1px solid #e5e7eb;}.total-row{font-weight:700;background:#ede9fe;}</style></head><body><div class="cover"><h1>${proposal.title}</h1><p>Prepared for ${proposal.client?.companyName || ''}</p></div>${proposal.executiveSummary ? `<div style="padding:48px"><h2>Executive Summary</h2><p>${proposal.executiveSummary}</p></div>` : ''}${pricing.length > 0 ? `<div style="padding:48px"><h2>Pricing</h2><table><thead><tr><th>Service</th><th>Total</th></tr></thead><tbody>${pricing.map((i: any) => `<tr><td>${i.service}</td><td>$${Number(i.total).toLocaleString()}</td></tr>`).join('')}<tr class="total-row"><td>Total</td><td>$${total.toLocaleString()}</td></tr></tbody></table></div>` : ''}</body></html>`;
}
