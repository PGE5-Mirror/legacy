import request from 'supertest';
import express from 'express';
import authRouter from '../../src/server/routes/auth.routes';
import registerController from '../../src/server/routes/auth/register';
import loginController from '../../src/server/routes/auth/login';

jest.mock('../../src/server/routes/auth/register', () => jest.fn((req, res) => res.status(201).json({ message: 'User registered successfully' })));
jest.mock('../../src/server/routes/auth/login', () => jest.fn((req, res) => res.status(200).json({ token: 'mock-jwt-token' })));

const app = express();
app.use(express.json());
app.use('/', authRouter);

describe('Auth Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /register should call register controller and return 201', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'Password123!' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'User registered successfully' });
    expect(registerController).toHaveBeenCalled();
  });

  it('POST /login should call login controller and return 200 with token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'Password123!' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: 'mock-jwt-token' });
    expect(loginController).toHaveBeenCalled();
  });
});