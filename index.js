const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path')
const csv = require('csvtojson');
const bodyParser = require('body-parser')
const Trade = require('./models/Trade'); 
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname,'public')));

var storage = multer.diskStorage({
  destination:(req,file,cb) => {
    cb(null,'./public/uploads')
  },
  filename:(req,file,cb) => {
    cb(null, 'data')
  }
})
var upload = multer({ storage:storage });

app.post('/upload', upload.single('file'), async(req,res) => {
  try {

    const userData = [];
    csv()
    .fromFile(req.file.path)
    .then( async(response) => {
      for(var x = 0; x < response.length; x++){
        userData.push({
          userId: response[x].User_ID,
          utcTime: response[x].UTC_Time,
          operation: response[x].Operation,
          baseCoin: response[x].Market,
          buySellAmount: parseFloat(response[x]['Buy/Sell Amount']),
          price: response[x].Price,
        })
      }
      await Trade.insertMany(userData)
    })
    res.send({status:200, success:true, msg:"csv file imported successfully"})
  } catch (error) {
    res.send({status:400, success:false, msg:error})
  }
})

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});