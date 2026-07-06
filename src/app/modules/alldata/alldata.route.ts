import { Router } from 'express';
import { multerUpload } from '../../config/multer.config';
import { AlldataController } from './alldata.controller';

const router = Router();

router.get('/', AlldataController.getAllProducts);

// ⚠️ these must come BEFORE '/:id' or express will treat "admin"/"categories" as an id
router.get('/admin/overview', AlldataController.getAdminOverview);
router.get('/categories', AlldataController.getCategories);


router.get('/:id', AlldataController.getSingleProduct);
router.post('/create-product', multerUpload.single('file'), AlldataController.createProduct);
router.patch('/:id', multerUpload.single('file'), AlldataController.updateProduct);
router.delete('/:id', AlldataController.deleteProduct);

export const AlldataRoute = router;