const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const csv = require("csvtojson");
const Trade = require("./models/Trade");
const { getAssetBalances } = require("./balance.js");
require("dotenv").config();

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); 

app.use(express.json());

// Route for uploading CSV file
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
    res.status(200).json({
      status: 200,
      success: true,
      msg: "CSV file imported successfully",
    });
  } catch (error) {
    console.error("Error importing CSV file:", error.message);
    res.status(400).json({ status: 400, success: false, msg: error.message });
  }
});

// Route for calculating asset balances
app.post("/assetBalance", async (req, res) => {
  try {
    const { timestamp } = req.body;
    const assetBalances = await getAssetBalances(timestamp);
    res.status(200).json(assetBalances);
  } catch (error) {
    console.error("Error calculating asset balances:", error.message);
    res.status(400).json({ status: 400, success: false, msg: error.message });
  }
});

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
