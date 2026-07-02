//start server
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require("./src/app");
const connectDB = require("./src/db/db");


connectDB();


app.listen(3000,()=>{
    console.log("server is running on port 3000");
})

