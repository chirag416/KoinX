const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const csv = require("csvtojson");
const Trade = require("./models/Trade");
require("dotenv").config();

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file.buffer.toString();
    const trades = await csv().fromString(buffer);

    const formattedTrades = trades.map((row) => {
      const [baseCoin, quoteCoin] = row["Market"].split("/");
      return {
        userId: parseInt(row["User_ID"]),
        utcTime: new Date(row["UTC_Time"]),
        operation: row["Operation"],
        baseCoin: baseCoin.trim(), 
        quoteCoin: quoteCoin.trim(),
        buySellAmount: parseFloat(row["Buy/Sell Amount"]),
        price: parseFloat(row["Price"]),
      };
    });

    await Trade.insertMany(formattedTrades);
    res.send({
      status: 200,
      success: true,
      msg: "CSV file imported successfully",
    });
  } catch (error) {
    res.send({ status: 400, success: false, msg: error.message });
  }
});

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT;

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
