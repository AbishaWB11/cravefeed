process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
process.env.IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || 'test-public-key'
process.env.IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || 'test-private-key'
process.env.IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/test'

const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongod

async function connect() {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  if (mongod) await mongod.stop()
}

async function clearDatabase() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

module.exports = { connect, closeDatabase, clearDatabase }
