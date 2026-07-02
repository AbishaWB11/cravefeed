const request = require('supertest')
const { connect, closeDatabase, clearDatabase } = require('./setup')

let app

beforeAll(async () => {
  await connect()
  app = require('../src/app')
})

afterEach(async () => {
  await clearDatabase()
})

afterAll(async () => {
  await closeDatabase()
})

describe('User auth', () => {
  const validUser = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
  }

  it('registers a new user and sets an httpOnly cookie', async () => {
    const res = await request(app).post('/api/auth/user/register').send(validUser)

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ email: validUser.email, fullName: validUser.fullName })
    expect(res.body.user.password).toBeUndefined()

    const cookie = res.headers['set-cookie'][0]
    expect(cookie).toMatch(/HttpOnly/)
    expect(cookie).toMatch(/SameSite=Lax/)
  })

  it('rejects registration with a short password', async () => {
    const res = await request(app)
      .post('/api/auth/user/register')
      .send({ ...validUser, password: '123' })

    expect(res.status).toBe(400)
  })

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/user/register').send(validUser)
    const res = await request(app).post('/api/auth/user/register').send(validUser)

    expect(res.status).toBe(400)
  })

  it('logs in with correct credentials and rejects wrong password', async () => {
    await request(app).post('/api/auth/user/register').send(validUser)

    const good = await request(app)
      .post('/api/auth/user/login')
      .send({ email: validUser.email, password: validUser.password })
    expect(good.status).toBe(200)

    const bad = await request(app)
      .post('/api/auth/user/login')
      .send({ email: validUser.email, password: 'wrongpassword' })
    expect(bad.status).toBe(400)
  })

  it('blocks protected routes without a token', async () => {
    const res = await request(app).get('/api/food/')
    expect(res.status).toBe(401)
  })
})

describe('Food partner auth', () => {
  const validPartner = {
    name: "Sunny's Kitchen",
    contactName: 'Sunny Lee',
    email: 'sunny@example.com',
    phone: '1234567890',
    address: '1 Main St',
    password: 'password123',
  }

  it('registers a new food partner', async () => {
    const res = await request(app).post('/api/auth/food-partner/register').send(validPartner)

    expect(res.status).toBe(201)
    expect(res.body.foodPartner.email).toBe(validPartner.email)
    expect(res.body.foodPartner.password).toBeUndefined()
  })

  it('rejects a food partner using a user-only route', async () => {
    const agent = request.agent(app)
    await agent.post('/api/auth/food-partner/register').send(validPartner)

    const res = await agent.get('/api/food/')
    expect(res.status).toBe(401)
  })
})
