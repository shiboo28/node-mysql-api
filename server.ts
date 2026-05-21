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

// allow cors requests from configured origin and with credentials
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// health check endpoint (does not require database initialized to respond)
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

// start server
const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, '0.0.0.0', () => console.log('Server listening on port ' + port));