//start server
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require("./src/app");
const connectDB = require("./src/db/db");


connectDB();


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})

