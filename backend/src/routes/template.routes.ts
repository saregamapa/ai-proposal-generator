import { Router } from 'express';
import { listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } from '../controllers/template.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', listTemplates);
router.get('/:id', getTemplate);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
