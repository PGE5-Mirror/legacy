import path from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project API Rest',
      version: '1.0.0',
      description: 'Documentation of the REST API covering auth, items, projects, etc.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, './routes/**/*.ts'),
    path.join(__dirname, './routes/**/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);