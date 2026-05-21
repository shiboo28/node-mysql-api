import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = express.Router();

// Try multiple locations for swagger.yaml
let swaggerDocument: any = null;
const swaggerPaths = [
    path.join(__dirname, '../swagger.yaml'),
    path.join(process.cwd(), 'swagger.yaml'),
];
for (const p of swaggerPaths) {
    try {
        swaggerDocument = YAML.load(p);
        break;
    } catch (e) {
        // try next path
    }
}

if (swaggerDocument) {
    router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
    router.get('/', (req, res) => res.json({ message: 'API docs unavailable - swagger.yaml not found' }));
}

export default router;