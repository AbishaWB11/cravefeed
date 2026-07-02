jest.mock('../src/services/storage.service', () => ({
  uploadFile: jest.fn().mockResolvedValue({ url: 'https://fake.test/video.mp4' }),
}))

const request = require('supertest')
const { connect, closeDatabase, clearDatabase } = require('./setup')

let app

beforeAll(async () => {
  await connect()
  app = require('../src/app')
})

afterEach(async () => {
  await clearDatabase()
  jest.clearAllMocks()
})

afterAll(async () => {
  await closeDatabase()
})

const partner = {
  name: "Sunny's Kitchen",
  contactName: 'Sunny Lee',
  email: 'sunny@example.com',
  phone: '1234567890',
  address: '1 Main St',
  password: 'password123',
}

const user = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  password: 'password123',
}

async function registerPartner() {
  const agent = request.agent(app)
  const res = await agent.post('/api/auth/food-partner/register').send(partner)
  return { agent, partnerId: res.body.foodPartner._id }
}

async function registerUser() {
  const agent = request.agent(app)
  await agent.post('/api/auth/user/register').send(user)
  return agent
}

async function createFoodItem(agent, overrides = {}) {
  const res = await agent
    .post('/api/food/')
    .field('name', overrides.name || 'Spicy Burger')
    .field('description', overrides.description || 'A delicious spicy burger')
    .attach('mama', Buffer.from('fake video bytes'), 'clip.mp4')
  return res
}

describe('Create food', () => {
  it('rejects when no video file is attached', async () => {
    const { agent } = await registerPartner()
    const res = await agent.post('/api/food/').field('name', 'No Video').field('description', 'oops')
    expect(res.status).toBe(400)
  })

  it('rejects when not authenticated as a food partner', async () => {
    const res = await request(app)
      .post('/api/food/')
      .field('name', 'Spicy Burger')
      .attach('mama', Buffer.from('fake video bytes'), 'clip.mp4')
    expect(res.status).toBe(401)
  })

  it('creates a food item and stores the uploaded video URL', async () => {
    const { agent } = await registerPartner()
    const res = await createFoodItem(agent)

    expect(res.status).toBe(201)
    expect(res.body.food.video).toBe('https://fake.test/video.mp4')
    expect(res.body.food.likeCount).toBe(0)
    expect(res.body.food.savesCount).toBe(0)
  })
})

describe('Feed', () => {
  it('returns items with partner name populated and isLiked/isSaved false by default', async () => {
    const { agent: partnerAgent } = await registerPartner()
    await createFoodItem(partnerAgent)

    const userAgent = await registerUser()
    const res = await userAgent.get('/api/food/')

    expect(res.status).toBe(200)
    expect(res.body.foodItems).toHaveLength(1)
    expect(res.body.foodItems[0].foodPartner.name).toBe(partner.name)
    expect(res.body.foodItems[0].isLiked).toBe(false)
    expect(res.body.foodItems[0].isSaved).toBe(false)
  })
})

describe('Like and save', () => {
  async function setup() {
    const { agent: partnerAgent } = await registerPartner()
    const createRes = await createFoodItem(partnerAgent)
    const userAgent = await registerUser()
    return { foodId: createRes.body.food._id, userAgent }
  }

  it('likes then unlikes a food item, toggling likeCount', async () => {
    const { foodId, userAgent } = await setup()

    const like = await userAgent.post('/api/food/like').send({ foodId })
    expect(like.status).toBe(201)
    expect(like.body.likeCount).toBe(1)

    const unlike = await userAgent.post('/api/food/like').send({ foodId })
    expect(unlike.status).toBe(200)
    expect(unlike.body.likeCount).toBe(0)
  })

  it('saves a food item and lists it under /api/food/save', async () => {
    const { foodId, userAgent } = await setup()

    const save = await userAgent.post('/api/food/save').send({ foodId })
    expect(save.status).toBe(201)
    expect(save.body.savesCount).toBe(1)

    const list = await userAgent.get('/api/food/save')
    expect(list.status).toBe(200)
    expect(list.body.savedFoods).toHaveLength(1)
    expect(list.body.savedFoods[0].food._id).toBe(foodId)
  })

  it('returns 404 from /api/food/save when nothing is saved', async () => {
    const { userAgent } = await setup()
    const res = await userAgent.get('/api/food/save')
    expect(res.status).toBe(404)
  })
})

describe('Partner-scoped food listing', () => {
  it('only returns the authenticated partner’s own items via /api/food/mine', async () => {
    const { agent: partnerA } = await registerPartner()
    await createFoodItem(partnerA, { name: 'Partner A Dish' })

    const { agent: partnerB } = await (async () => {
      const agent = request.agent(app)
      const res = await agent.post('/api/auth/food-partner/register').send({
        ...partner,
        email: 'other@example.com',
      })
      return { agent, partnerId: res.body.foodPartner._id }
    })()
    await createFoodItem(partnerB, { name: 'Partner B Dish' })

    const res = await partnerA.get('/api/food/mine')
    expect(res.status).toBe(200)
    expect(res.body.foodItems).toHaveLength(1)
    expect(res.body.foodItems[0].name).toBe('Partner A Dish')
  })
})

describe('Food partner profile', () => {
  it('excludes the password hash from the response', async () => {
    const { agent, partnerId } = await registerPartner()
    const userAgent = await registerUser()

    const res = await userAgent.get(`/api/food-partner/${partnerId}`)
    expect(res.status).toBe(200)
    expect(res.body.foodPartner.password).toBeUndefined()
    void agent
  })
})
