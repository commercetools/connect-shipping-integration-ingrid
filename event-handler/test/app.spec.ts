import { expect } from '@jest/globals';
import request from 'supertest';
import express, { Request, Response } from 'express';
import app from '../src/app';
import { readConfiguration } from '../src/utils/config.utils';

jest.mock('../src/utils/config.utils');
jest.mock('../src/routes/event.route', () => {
  const router = express.Router();
  router.post('/', (_req: Request, res: Response) => {
    res.status(200).send({ success: true });
  });
  return router;
});

describe('App configuration', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockReturnValue({
      ingridApiKey: 'test-api-key',
      ingridEnvironment: 'test',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should setup express app with appropriate middleware', async () => {
    // Check that the app has the necessary middleware by making a simple request
    const response = await request(app).post('/').send({ test: 'data' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(readConfiguration).toHaveBeenCalled();
  });

  test('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-path');

    expect(response.status).toBe(404);
  });

  test('should disable x-powered-by header', async () => {
    const response = await request(app).get('/');

    expect(response.headers).not.toHaveProperty('x-powered-by');
  });

  test('should handle JSON bodies', async () => {
    const testData = { key: 'value' };
    const response = await request(app).post('/').send(testData);

    expect(response.status).toBe(200);
  });

  test('should handle URL-encoded bodies', async () => {
    const response = await request(app)
      .post('/')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('key=value');

    expect(response.status).toBe(200);
  });
});
