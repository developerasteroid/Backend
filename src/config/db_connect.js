const mongoose = require("mongoose");
const {DB_NAME} = require("./../constants");

mongoose.connect(process.env.DB_URI + DB_NAME);

const db = mongoose.connection;

db.on("connected", () => {
    console.log("MongoDB connection Successful");
});

db.on("error", () => {
    console.log("MongoDB connection Failed");
});