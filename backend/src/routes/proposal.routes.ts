import { Router } from 'express';
import {
  listProposals, getProposal, generateProposal, updateProposal,
  sendProposal, deleteProposal, generatePdf, duplicateProposal,
} from '../controllers/proposal.controller';
import { authenticate, requirePlan } from '../middleware/auth';
import { aiRateLimit } from '../middleware/security';

const router = Router();
router.use(authenticate);

router.get('/', listProposals);
router.get('/:id', getProposal);
router.post('/generate', aiRateLimit, generateProposal);
router.put('/:id', updateProposal);
router.post('/:id/send', sendProposal);
router.post('/:id/duplicate', duplicateProposal);
router.delete('/:id', deleteProposal);
router.post('/:id/pdf', generatePdf);

export default router;
