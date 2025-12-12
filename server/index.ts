/**
 * TypeScript Backend Server
 * Unified backend for PM App using Hono with OpenAPI documentation
 */

import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { apiReference } from '@scalar/hono-api-reference';

// Import routes
import projectsRoutes from './routes/projects';
import tasksRoutes from './routes/tasks';
import linksRoutes from './routes/links';
import importRoutes from './routes/import';
import analyticsRoutes from './routes/analytics';
import reasoningRoutes from './routes/reasoning';

const app = new OpenAPIHono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PM App Backend',
  });
});

// API routes
app.route('/api/projects', projectsRoutes);
app.route('/api', tasksRoutes);
app.route('/api', linksRoutes);
app.route('/api/import', importRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/reasoning', reasoningRoutes);

// OpenAPI documentation
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'PM App API',
    version: '1.0.0',
    description: 'Project Management Application API with SPARQL backend',
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Development server',
    },
  ],
});

// Scalar API Reference UI
app.get(
  '/docs',
  apiReference({
    spec: {
      url: '/openapi.json',
    },
    theme: 'purple',
    darkMode: true,
  })
);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message,
  }, 500);
});

const port = parseInt(process.env.API_PORT || '8000');

console.log(`🚀 Backend server starting on port ${port}`);
console.log(`📊 SPARQL endpoint: ${process.env.NEXT_PUBLIC_GRAPHDB_ENDPOINT || 'http://localhost:3030'}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server running at http://localhost:${port}`);
console.log(`📝 Health check: http://localhost:${port}/health`);
console.log(`📖 API base: http://localhost:${port}/api`);
