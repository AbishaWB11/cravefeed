const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "Video file is required" });
    }

    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id
    })

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })

}

async function getFoodItems(req, res) {
    const user = req.user;

    const foodItems = await foodModel.find({})
        .sort({ createdAt: -1 })
        .populate('foodPartner', 'name')

    const foodIds = foodItems.map(item => item._id);

    const [likedDocs, savedDocs] = await Promise.all([
        likeModel.find({ user: user._id, food: { $in: foodIds } }),
        saveModel.find({ user: user._id, food: { $in: foodIds } })
    ])

    const likedSet = new Set(likedDocs.map(doc => doc.food.toString()))
    const savedSet = new Set(savedDocs.map(doc => doc.food.toString()))

    const items = foodItems.map(item => ({
        ...item.toObject(),
        isLiked: likedSet.has(item._id.toString()),
        isSaved: savedSet.has(item._id.toString())
    }))

    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems: items
    })
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        const food = await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        }, { returnDocument: 'after' })

        return res.status(200).json({
            message: "Food unliked successfully",
            likeCount: food.likeCount
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    const food = await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    }, { returnDocument: 'after' })

    res.status(201).json({
        message: "Food liked successfully",
        like,
        likeCount: food.likeCount
    })

}

async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })

        const food = await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        }, { returnDocument: 'after' })

        return res.status(200).json({
            message: "Food unsaved successfully",
            savesCount: food.savesCount
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })

    const food = await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    }, { returnDocument: 'after' })

    res.status(201).json({
        message: "Food saved successfully",
        save,
        savesCount: food.savesCount
    })

}

async function getMyFoodItems(req, res) {
    const foodPartner = req.foodPartner;

    const foodItems = await foodModel.find({ foodPartner: foodPartner._id }).sort({ createdAt: -1 })

    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems
    })
}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(404).json({ message: "No saved foods found" });
    }

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods
    });

}


module.exports = {
    createFood,
    getFoodItems,
    getMyFoodItems,
    likeFood,
    saveFood,
    getSaveFood
}