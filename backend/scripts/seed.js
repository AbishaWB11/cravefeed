const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { v4: uuid } = require('uuid')

const foodModel = require('../src/models/food.model')
const foodPartnerModel = require('../src/models/foodpartner.model')
const storageService = require('../src/services/storage.service')

const TARGET_COUNT = 20
const PARTNER_EMAIL = 'kitchen@cravefeed.demo'

async function getOrCreateDemoPartner() {
  let partner = await foodPartnerModel.findOne({ email: PARTNER_EMAIL })
  if (partner) return partner

  const hashedPassword = await bcrypt.hash('DemoKitchen123!', 10)
  partner = await foodPartnerModel.create({
    name: 'CraveFeed Kitchen',
    contactName: 'Demo Chef',
    email: PARTNER_EMAIL,
    phone: '0000000000',
    address: 'Seed Data, Internet',
    password: hashedPassword,
  })
  return partner
}

async function fetchMealsForLetter(letter) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`)
  const data = await res.json()
  return data.meals || []
}

function buildIngredients(meal) {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ingredient && ingredient.trim()) {
      const line = [measure?.trim(), ingredient.trim()].filter(Boolean).join(' ')
      ingredients.push(line)
    }
  }
  return ingredients
}

async function searchPexels(query) {
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=3&orientation=portrait`,
    { headers: { Authorization: process.env.PEXELS_API_KEY } }
  )
  if (!res.ok) throw new Error(`Pexels ${res.status}`)
  const data = await res.json()
  const video = data.videos?.[0]
  if (!video) return null

  const files = video.video_files.filter((f) => f.file_type === 'video/mp4' && f.height >= f.width)
  const file = files.sort((a, b) => Math.abs(a.height - 1280) - Math.abs(b.height - 1280))[0] || video.video_files[0]
  return file?.link || null
}

async function findMatchingVideo(meal) {
  const firstWords = meal.strMeal.split(' ').slice(0, 2).join(' ')
  return (
    (await searchPexels(meal.strMeal)) ||
    (await searchPexels(firstWords)) ||
    (await searchPexels(meal.strCategory))
  )
}

async function downloadBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  const partner = await getOrCreateDemoPartner()
  console.log(`Using demo partner: ${partner.name} (${partner._id})`)

  let created = await foodModel.countDocuments({ foodPartner: partner._id })
  if (created >= TARGET_COUNT) {
    console.log(`Already have ${created} seeded items. Nothing to do.`)
    await mongoose.connection.close()
    return
  }

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

  for (const letter of letters) {
    if (created >= TARGET_COUNT) break

    let meals
    try {
      meals = await fetchMealsForLetter(letter)
    } catch (err) {
      console.log(`  MealDB fetch failed for "${letter}": ${err.message}`)
      continue
    }

    for (const meal of meals) {
      if (created >= TARGET_COUNT) break

      const alreadyExists = await foodModel.findOne({ name: meal.strMeal, foodPartner: partner._id })
      if (alreadyExists) continue

      let videoLink
      try {
        videoLink = await findMatchingVideo(meal)
      } catch (err) {
        console.log(`  Pexels search failed for "${meal.strMeal}": ${err.message}`)
        continue
      }

      if (!videoLink) {
        console.log(`  Skipping "${meal.strMeal}" - no matching video found`)
        continue
      }

      try {
        const buffer = await downloadBuffer(videoLink)
        const uploadResult = await storageService.uploadFile(buffer, uuid())

        await foodModel.create({
          name: meal.strMeal,
          description: `${meal.strArea || ''} ${meal.strCategory || ''}`.trim() || undefined,
          video: uploadResult.url,
          foodPartner: partner._id,
          recipe: {
            ingredients: buildIngredients(meal),
            instructions: meal.strInstructions,
            sourceName: 'TheMealDB',
            sourceUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
          },
        })

        created++
        console.log(`  [${created}/${TARGET_COUNT}] Seeded "${meal.strMeal}"`)
      } catch (err) {
        console.log(`  Failed to seed "${meal.strMeal}": ${err.message}`)
      }
    }
  }

  console.log(`Done. Seeded ${created} food items total for demo partner.`)
  await mongoose.connection.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
