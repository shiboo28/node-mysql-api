const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node MySQL API',
      version: '1.0.0',
      description: 'Node.js + MySQL - API with email sign-up, verification, authentication and forgot password',
      contact: { name: 'API Support' }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Account: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Mr' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['Admin', 'User'], example: 'User' },
            created: { type: 'string', format: 'date-time' },
            isVerified: { type: 'boolean', example: true }
          }
        },
        AuthenticateRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['title', 'firstName', 'lastName', 'email', 'password', 'confirmPassword', 'acceptTerms'],
          properties: {
            title: { type: 'string', example: 'Mr' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            confirmPassword: { type: 'string', example: 'password123' },
            acceptTerms: { type: 'boolean', example: true }
          }
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Success' }
          }
        }
      }
    },
    paths: {
      '/accounts/authenticate': {
        post: {
          summary: 'Authenticate account credentials and return a JWT token and a cookie with a refresh token',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/AuthenticateRequest' } } }
          },
          responses: {
            '200': { description: 'Success' },
            '400': { description: 'Invalid credentials' }
          }
        }
      },
      '/accounts/register': {
        post: {
          summary: 'Register a new user account',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/RegisterRequest' } } }
          },
          responses: {
            '200': { description: 'Registration successful' },
            '400': { description: 'Email already registered' }
          }
        }
      },
      '/accounts/refresh-token': {
        post: {
          summary: 'Use a refresh token to generate a new JWT token and a new refresh token',
          responses: { '200': { description: 'Success' } }
        }
      },
      '/accounts/revoke-token': {
        post: {
          summary: 'Revoke a refresh token',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Success' } }
        }
      },
      '/accounts/verify-email': {
        post: {
          summary: 'Verify a new account with a verification token',
          responses: { '200': { description: 'Verification successful' } }
        }
      },
      '/accounts/forgot-password': {
        post: {
          summary: 'Submit email address to receive a password reset email',
          responses: { '200': { description: 'Success' } }
        }
      },
      '/accounts/validate-reset-token': {
        post: {
          summary: 'Validate the reset token',
          responses: { '200': { description: 'Token is valid' } }
        }
      },
      '/accounts/reset-password': {
        post: {
          summary: 'Reset password with a valid token',
          responses: { '200': { description: 'Password reset successful' } }
        }
      },
      '/accounts': {
        get: {
          summary: 'Get all accounts (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Success' } }
        },
        post: {
          summary: 'Create a new account (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Account created' } }
        }
      },
      '/accounts/{id}': {
        get: {
          summary: 'Get account by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Success' } }
        },
        put: {
          summary: 'Update account',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Account updated' } }
        },
        delete: {
          summary: 'Delete account',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Account deleted' } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;