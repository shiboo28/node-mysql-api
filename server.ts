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

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200, https://angular-auth-boilerplate-nh8l.onrender.com')
    .split(',')
    .map(o => o.trim());

const corsOptions = {
    origin: (origin: any, callback: any) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('Not allowed by CORS'), false);
        }
        return callback(null, true);
    },
    credentials: true
};

// Handle preflight for ALL routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// health check endpoint
app.get('/health', (req, res) => {
    const db = require('./_helpers/db').default;
    res.json({
        status: db.initialized ? 'healthy' : 'unhealthy',
        database: db.initialized ? 'connected' : 'disconnected',
        error: db.error
    });
});

// database health barrier for api routes
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

// api routes
app.use('/accounts', accountsController);

// swagger docs route
app.use('/api-docs', swaggerDocs);

// global error handler
app.use(errorHandler);

const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, '0.0.0.0', () => console.log('Server listening on port ' + port));