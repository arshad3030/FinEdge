const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { loadConfig } = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/user.model');
const Budget = require('../src/models/budget.model');

const config = loadConfig();

async function createTestUser(email = `test${Date.now()}@example.com`, password = 'testpass123', name = 'Test User') {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, name });
  return user;
}

function getAuthToken(user) {
  const payload = { userId: user._id.toString() };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

async function createTestBudget(userId, data = {}) {
  const budgetData = {
    userId,
    month: data.month || 1,
    year: data.year || 2024,
    monthlyGoal: data.monthlyGoal || 5000,
    savingsTarget: data.savingsTarget || 1000,
    ...data
  };
  const budget = await Budget.create(budgetData);
  return budget;
}

describe('Budget routes', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      const testConnection = config.dbConnection || 'mongodb://localhost:27017';
      const testConfig = {
        ...config,
        dbConnection: testConnection,
        dbName: 'test_finedge'
      };
      await connectDB(testConfig);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Budget.deleteMany({});
  });

  describe('POST /budgets', () => {
    test('should create budget successfully with valid data', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const budgetData = {
        month: 1,
        year: 2024,
        monthlyGoal: 5000,
        savingsTarget: 1000
      };

      const response = await request(app)
        .post('/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send(budgetData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.month).toBe(1);
      expect(response.body.year).toBe(2024);
      expect(response.body.monthlyGoal).toBe(5000);
      expect(response.body.savingsTarget).toBe(1000);
      expect(response.body.userId).toBe(user._id.toString());

      const budgetInDb = await Budget.findById(response.body._id);
      expect(budgetInDb).toBeTruthy();
      expect(budgetInDb.month).toBe(1);
    });

    test('should return 400 when month is less than 1', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: 0,
          year: 2024,
          monthlyGoal: 5000,
          savingsTarget: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid budget input');
      expect(response.body.error.details).toContain('month must be a number between 1 and 12');
    });

    test('should return 400 when month is greater than 12', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: 13,
          year: 2024,
          monthlyGoal: 5000,
          savingsTarget: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('month must be a number between 1 and 12');
    });

    test('should return 400 when year is less than or equal to 0', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: 1,
          year: 0,
          monthlyGoal: 5000,
          savingsTarget: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('year must be a positive number');
    });

    test('should return 400 when monthlyGoal is negative', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: 1,
          year: 2024,
          monthlyGoal: -100,
          savingsTarget: 1000
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('monthlyGoal must be a non-negative number');
    });

    test('should return 400 when savingsTarget is negative', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .post('/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: 1,
          year: 2024,
          monthlyGoal: 5000,
          savingsTarget: -100
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('savingsTarget must be a non-negative number');
    });

    test('should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .post('/budgets')
        .send({
          month: 1,
          year: 2024,
          monthlyGoal: 5000,
          savingsTarget: 1000
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /budgets', () => {
    test('should return empty array when user has no budgets', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      const response = await request(app)
        .get('/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should return all budgets for user sorted by year and month desc', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      await createTestBudget(user._id, { month: 1, year: 2024 });
      await createTestBudget(user._id, { month: 3, year: 2024 });
      await createTestBudget(user._id, { month: 2, year: 2023 });

      const response = await request(app)
        .get('/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].year).toBe(2024);
      expect(response.body[0].month).toBe(3);
      expect(response.body[1].year).toBe(2024);
      expect(response.body[1].month).toBe(1);
      expect(response.body[2].year).toBe(2023);
    });

    test('should filter budgets by month', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      await createTestBudget(user._id, { month: 1, year: 2024 });
      await createTestBudget(user._id, { month: 2, year: 2024 });
      await createTestBudget(user._id, { month: 1, year: 2023 });

      const response = await request(app)
        .get('/budgets?month=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.every(b => b.month === 1)).toBe(true);
    });

    test('should filter budgets by year', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      await createTestBudget(user._id, { month: 1, year: 2024 });
      await createTestBudget(user._id, { month: 2, year: 2023 });
      await createTestBudget(user._id, { month: 3, year: 2024 });

      const response = await request(app)
        .get('/budgets?year=2024')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.every(b => b.year === 2024)).toBe(true);
    });

    test('should filter budgets by month and year', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);

      await createTestBudget(user._id, { month: 1, year: 2024 });
      await createTestBudget(user._id, { month: 1, year: 2023 });
      await createTestBudget(user._id, { month: 2, year: 2024 });

      const response = await request(app)
        .get('/budgets?month=1&year=2024')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].month).toBe(1);
      expect(response.body[0].year).toBe(2024);
    });

    test('should only return budgets for authenticated user', async () => {
      const user1 = await createTestUser('user1@test.com');
      const user2 = await createTestUser('user2@test.com');
      const token1 = getAuthToken(user1);

      await createTestBudget(user1._id, { month: 1, year: 2024 });
      await createTestBudget(user2._id, { month: 2, year: 2024 });

      const response = await request(app)
        .get('/budgets')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user1._id.toString());
    });

    test('should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .get('/budgets');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /budgets/:id', () => {
    test('should return budget when found', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id, { month: 5, year: 2024, monthlyGoal: 6000 });

      const response = await request(app)
        .get(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(budget._id.toString());
      expect(response.body.month).toBe(5);
      expect(response.body.year).toBe(2024);
      expect(response.body.monthlyGoal).toBe(6000);
    });

    test('should return 404 when budget not found', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Budget not found');
    });

    test('should return 404 when budget belongs to different user', async () => {
      const user1 = await createTestUser('user1@test.com');
      const user2 = await createTestUser('user2@test.com');
      const token1 = getAuthToken(user1);
      const budget2 = await createTestBudget(user2._id);

      const response = await request(app)
        .get(`/budgets/${budget2._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Budget not found');
    });

    test('should return 401 when Authorization header is missing', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/budgets/${fakeId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /budgets/:id', () => {
    test('should update budget partially', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id, { monthlyGoal: 5000 });

      const response = await request(app)
        .patch(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ monthlyGoal: 6000 });

      expect(response.status).toBe(200);
      expect(response.body.monthlyGoal).toBe(6000);
      expect(response.body.month).toBe(budget.month);
      expect(response.body.year).toBe(budget.year);
    });

    test('should update budget with all fields', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id);

      const response = await request(app)
        .patch(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: 6,
          year: 2025,
          monthlyGoal: 7000,
          savingsTarget: 2000
        });

      expect(response.status).toBe(200);
      expect(response.body.month).toBe(6);
      expect(response.body.year).toBe(2025);
      expect(response.body.monthlyGoal).toBe(7000);
      expect(response.body.savingsTarget).toBe(2000);
    });

    test('should return 400 when month is invalid', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id);

      const response = await request(app)
        .patch(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ month: 15 });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('month must be a number between 1 and 12');
    });

    test('should return 400 when year is invalid', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id);

      const response = await request(app)
        .patch(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ year: -1 });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('year must be a positive number');
    });

    test('should return 400 when monthlyGoal is invalid', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id);

      const response = await request(app)
        .patch(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ monthlyGoal: -100 });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('monthlyGoal must be a non-negative number');
    });

    test('should return 400 when savingsTarget is invalid', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id);

      const response = await request(app)
        .patch(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ savingsTarget: -50 });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('savingsTarget must be a non-negative number');
    });

    test('should return 404 when budget not found', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ monthlyGoal: 6000 });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Budget not found');
    });

    test('should return 404 when budget belongs to different user', async () => {
      const user1 = await createTestUser('user1@test.com');
      const user2 = await createTestUser('user2@test.com');
      const token1 = getAuthToken(user1);
      const budget2 = await createTestBudget(user2._id);

      const response = await request(app)
        .patch(`/budgets/${budget2._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ monthlyGoal: 6000 });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Budget not found');
    });

    test('should return 401 when Authorization header is missing', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/budgets/${fakeId}`)
        .send({ monthlyGoal: 6000 });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /budgets/:id', () => {
    test('should delete budget successfully', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const budget = await createTestBudget(user._id);

      const response = await request(app)
        .delete(`/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const budgetInDb = await Budget.findById(budget._id);
      expect(budgetInDb).toBeNull();
    });

    test('should return 404 when budget not found', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user);
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Budget not found');
    });

    test('should return 404 when budget belongs to different user', async () => {
      const user1 = await createTestUser('user1@test.com');
      const user2 = await createTestUser('user2@test.com');
      const token1 = getAuthToken(user1);
      const budget2 = await createTestBudget(user2._id);

      const response = await request(app)
        .delete(`/budgets/${budget2._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Budget not found');
    });

    test('should return 401 when Authorization header is missing', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/budgets/${fakeId}`);

      expect(response.status).toBe(401);
    });
  });
});

