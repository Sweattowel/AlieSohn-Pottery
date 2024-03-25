import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors'
import { createRequire } from 'module'
import multer from 'multer'
import path from 'path'
import {dirname} from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
const dotenv = require('dotenv');
dotenv.config()
const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))
/*
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next()
})
app.use(bodyParser.json())
*/
const db = mysql.createConnection({
  connectionLimit: 10,
  host: process.env.REACT_APP_DATABASE_HOST,
  user: process.env.REACT_APP_DATABASE_USER,
  password: process.env.REACT_APP_DATABASE_PASSWORD,
  database: process.env.REACT_APP_DATABASE_DATABASE,
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use('/StoreImages', express.static(path.join(__dirname, 'StoreImages')))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, 'StoreImages')); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})
const upload = multer({ storage: storage })


/////////////////////////////////////////////////////////

app.post('/api/register', async (req, res) => {
  try {
    console.log('Received Registration attempt')
    
    const userName = req.body.userName
    const passWord = req.body.passWord

    const sql = 'SELECT * FROM userData WHERE userName = ?'
    db.execute(sql, [userName], (err, results) => {
      if (err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
      } else if (results.length > 0){
        res.status(409).json({ error: 'Invalid username: data already exists' })
      } else if (results.length == 0) {
        const sql2 ="INSERT INTO userData (userName, passWord) VALUES (?, ?)"
        db.execute(sql2, [userName, passWord], (err, results) => {
          if (err){
            res.status(500).json({ error: 'Internal server error'})
          } else {
            res.status(200).json({ message: 'Successfully registered'})
          }
        })
      }
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

/////////////////////////////////////////////////////////

app.post('/api/login', async (req, res) => {
  try {
    const sql = 'SELECT userID FROM userData WHERE userName = ? AND passWord = ?'
    const userName = req.body.userName
    const passWord = req.body.passWord
    console.log('Received jackoff log in attempt', userName, passWord)

    db.execute(sql, [userName, passWord], (err, results) => {
      if (err) {
        console.log(err)
      } else if(results.length > 1){
        console.log('Too many accounts with the same userName/Password please fix immediately')
        res.status(500).json({error: 'Server Failure'})
      } else if (results.length === 1){
        console.log('login success')
        const userID = results[0].userID
        const userName = results[0].userName
        console.log(userID)
        res.status(200).json({ message: 'Successfully Logged in', userID: userID, userName:userName })
      } else {
        res.status(404).json({ error: 'No user exists for this data'})
      }
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
//////////////////////////

app.post('/api/adminLogin', async ( req, res) => {
  try {
    console.log('Received admin log in attempt')
    const sql = 'SELECT * FROM admins WHERE userName = ? AND passWord = ?'
    const userName = req.body.userName
    const passWord = req.body.passWord
    db.execute(sql, [userName, passWord], (err, results) => {
      if (err){
        console.log(err)
      } else if (results.length === 1){
        const userID = results[0].adminID
        console.log(userID, ' logged in')
        res.status(200).json({ message: 'Successfully Logged in', userID })
      } else {
        res.status(404).json({ error: 'No user exists for this data'})
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
/////////////////////////////////////////////////////////

app.post('/api/storeItems', async (req, res) => {
  console.log('Request received for storeData')
  try {
    const sql = 'SELECT * FROM storeItems';
    db.execute(sql, (err, results) => {
      if (err){
        console.log(err)
      } else if (results.length === 0) {
        res.status(404).json({ error: 'No items available' });
      } else {
        res.status(200).json(results);
      }
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//////// brochure handler

let brochure = null
const createBrochure = () => {
  console.log('Making Brochure')
  const sql = 'SELECT storeItems.itemID, storeItems.itemName, storeItems.imagePath, storeItems.itemPrice, COUNT(orders.orderID) AS order_count FROM storeItems JOIN orders ON storeItems.itemID = orders.itemID GROUP BY storeItems.itemID, storeItems.itemName ORDER BY order_count DESC LIMIT 3;'
  db.execute(sql, (err, results) => {
    if (err){
      console.log(err)
    } else {
      console.log('Brochure made')
      brochure = results
    }
  })
}
const updateBrochure = () => {
  createBrochure()
  setInterval(createBrochure, 5 * 60 * 1000)
}
updateBrochure()
app.post('/api/getBrochure', async (req, res) => {
  console.log('Received Request for Brochure')
  try {
    if (brochure){
      res.status(200).json(brochure)
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({Error: 'Internal Server Error'})
  }
})
/////////////////////////////////////////////////////////

app.post('/api/createOrder', async (req, res) => {
  try {
    console.log('orders received')
    const userID = req.body.userID
    const userName = req.body.userName
    const itemIDs = req.body.itemIDs
    const sql = 'INSERT INTO orders (userName, userID, itemID) VALUES (? ,? ,? )'

    for (const itemID of itemIDs){
      await db.execute(sql, [userName, userID, itemID])
    }
    
    res.status(200).json({ message: 'orders successfully placed'})

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
/////////////////////////////////////////////////////////

app.post('/api/getOrders', async (req, res) => {
  try {
    const userID = req.body.userID
    const sql = `SELECT storeItems.itemName, orders.itemID, orders.orderID, completed FROM orders LEFT JOIN storeItems ON storeItems.itemID = orders.itemID WHERE userID = ?`

    db.execute(sql, [userID], (err, results) => {
      if (err){
        console.log(err)
      } else if (results.length === 0){
        res.status(404).json({ message: 'No orders for selected customer'})
      } else {
        res.status(200).json(results)
      }
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
app.post('/api/getUsers', async (req, res) => {
  try {
    const sql = 'SELECT userID, userName FROM userData'

    db.execute(sql, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error'})
      } else {
        res.status(200).json({ data: results })
      } 
    })   

  } catch (error) {
    console.log(error)
  }

})

app.post('/api/CreateItem', upload.single('picture'), async (req, res) => {
  try {
    console.log('Received Admin storeRequest')
    if (!req.file){
      res.status(404).json({ error: 'No picture found'})
      return
    }
    const {title, description, price} = req.body
    const pictureFileName = req.file.filename.toLowerCase()
    const relativeImagePath = `./StoreImages/${pictureFileName.toLowerCase()}`
    const sql = 'INSERT INTO storeItems (itemName, itemDescription, itemPrice, imagePath) VALUES (?,?,?,?)' 
    
    db.execute(sql, [title, description,price, relativeImagePath], (err, result) => {
      if (err){
        res.status(500).json({ error: 'Internal Server Error'})
      } else {
        res.status(200).json({ message: 'StoreItem successfully made'})
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
import fs from 'fs'

app.post('/api/removeItem', async (req, res) => {
  try {
    const itemID = req.body.storeItemID
    const sql1 = 'SELECT imagePath FROM storeItems WHERE itemID = ?'


    const sql = 'DELETE FROM storeItems WHERE itemID = ?'
    const sql2 = 'DELETE FROM orders WHERE itemID = ?'
    db.execute(sql1, [itemID], (err, result) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error'})
      } else {
        console.log(result)
        const imagePath = result[0].imagePath

        const imagePathOnServer = path.join(__dirname, imagePath)
        fs.unlinkSync(imagePathOnServer)
      }
    })
    db.execute(sql2, [itemID], (err, result) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error'})
      } 
    })
    db.execute(sql, [itemID], (err, result) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error'})
      }
    })


    res.status(200).json({ message: 'StoreItem successfully removed'})
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

app.post('/api/completeOrder', async (req, res) => {
  try {
    const sql = 'UPDATE orders SET completed = ? WHERE orderID = ? AND userID = ?'
    const orderID = req.body.orderID
    const userID = req.body.selectedCustomer
    const decision = req.body.decision
    db.execute(sql,[decision, orderID, userID], (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error'})
      } else {
        res.status(200).json({ message: 'Succesfully completed order' })
      } 
    })   

  } catch (error) {
    console.log(error)
  }
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
