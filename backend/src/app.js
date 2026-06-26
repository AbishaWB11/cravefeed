// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');


const app = express();
app.use(cookieParser());
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("server is running");
})          

app.use('/api/auth/', authRoutes);

module.exports = app;