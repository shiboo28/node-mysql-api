import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.options('*', cors({ origin: 'https://angular-auth-boilerplate-nh8i.onrender.com', credentials: true }));
app.use(cors({ origin: 'https://angular-auth-boilerplate-nh8i.onrender.com', credentials: true }));

app.get('/health', (req, res) => {
    const db = require('./_helpers/db').default;
    res.json({
        status: db.initialized ? 'healthy' : 'unhealthy',
        database: db.initialized ? 'connected' : 'disconnected',
        error: db.error
    });
});

app.use((req, res, next) => {
    const db = require('./_helpers/db').default;
    if (!db.initialized) {
        return res.status(503).json({
            message: 'Database is not initialized yet or failed to initialize',
            error: db.error || 'Unknown database error'
        });
    }
    next();
});

app.use('/accounts', accountsController);
app.use('/api-docs', swaggerDocs);
app.use(errorHandler);

const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, '0.0.0.0', () => console.log('Server listening on port ' + port));