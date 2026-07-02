const mongoose =    require('mongoose');


const foodSchema = new mongoose.Schema({

name:{
    type: String,
    required:true,
},
video:{
    type:String,
    required:true,
},
description:{
    type: String,
},
foodPartner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "foodpartner"
},
likeCount:{
    type: Number,
    default: 0
},
savesCount:{
    type: Number,
    default: 0
},
recipe:{
    ingredients: [{ type: String }],
    instructions: { type: String },
    sourceName: { type: String },
    sourceUrl: { type: String }
}
},{
    timestamps: true
})

const foodModel= mongoose.model("food", foodSchema);

module.exports = foodModel;