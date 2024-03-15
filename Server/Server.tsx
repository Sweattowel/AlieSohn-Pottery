import express from 'express';
import mysql, { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import bodyParser from 'body-parser';
import { Query } from 'mysql2/typings/mysql/lib/protocol/sequences/Query';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.REACT_APP_DATABASE_HOST,
  user: process.env.REACT_APP_DATABASE_USER,
  password: process.env.REACT_APP_DATABASE_PASSWORD,
  database: process.env.REACT_APP_DATABASE_DATABASE,
});

app.use(bodyParser.json());

interface CodeResponse {
  status: (code: number) => {
    json: (data: { error?: string; message?: string}) => void;
  }
}

/////////////////////////////////////////////////////////
interface RegistrationRequest {
  body: {
    userName: string,
    passWord: string
  }
}
app.post('/api/register', async (req: Request & RegistrationRequest, res: Response & CodeResponse) => {
  try {
    const sql: string = 'SELECT * FROM userData WHERE userName = ?'
    const userName: string = req.body.userName
    const passWord: string = req.body.passWord
    const response: Query = db.execute(sql, [userName])

    if ((response !== null)){
      res.status(409).json({ error: 'Invalid username: data already exists' })
    } else {
      const sql2 ="INSERT INTO userData (userName, passWord) VALUES (?, ?)"
      db.execute(sql2, [userName, passWord])
      res.status(200).json({ message: 'Successfully registered'})
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

/////////////////////////////////////////////////////////
interface LoginRequest {
  body: {
    userName: string,
    passWord: string
  }
}
app.post('/api/login', async ( req: Request & LoginRequest, res: Response & CodeResponse) => {
  try {
    const sql: string = 'SELECT * FROM userData WHERE userName = ? AND passWord = ?'
    const userName: string = req.body.userName
    const passWord: string = req.body.passWord
    const response: Query = db.execute(sql, [userName, passWord])

    if ((response !== null)){
      res.status(200).json({ message: 'Successfully Logged in' })
    } else {
      res.status(404).json({ error: 'No user exists for this data'})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
//////////////////////////

app.post('/api/adminLogin', async ( req: Request & LoginRequest, res: Response & CodeResponse) => {
  try {
    const sql: string = 'SELECT * FROM admins WHERE userName = ? AND passWord = ?'
    const userName: string = req.body.userName
    const passWord: string = req.body.passWord
    const response: Query = db.execute(sql, [userName, passWord])

    if ((response !== null)){
      res.status(200).json({ message: 'Successfully Logged in' })
    } else {
      res.status(404).json({ error: 'No user exists for this data'})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
/////////////////////////////////////////////////////////
interface StoreCodeResponse {
  status: (code: number) => {
    json: (data: { error?: string; data?: RowDataPacket[] }) => void;
  };  
}
app.post('/api/storeItems', async (req, res) => {
  try {
    const sql = 'SELECT * FROM storeItems';

    db.execute(sql, (err, results) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'No items' });
      } else {
        res.status(200).json(results)
      }
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/////////////////////////////////////////////////////////
interface RequestOrder {
  body: {
    userName: string,
    userID: number,
    itemIDs: number[]
  }
}
app.post('/api/createOrder', async (req: Request & RequestOrder, res: Response & CodeResponse) => {
  try {
    const userName = req.body.userName
    const userID = req.body.userID
    const itemIDs = req.body.itemIDs
    const sql = 'INSERT INTO orders (userName, userID, itemID) VALUES (? ,? ,? )'

    await Promise.all(itemIDs.map(itemID => db.execute(sql, [userName, userID, itemID])));
    
    res.status(200).json({ message: 'orders successfully placed'})

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
/////////////////////////////////////////////////////////
interface RequestIDOrders {
  body: {
    userName: string,
    userID: number,
  }
}
interface CustomerItemsResponse {
  status: (code: number) => {
    json: (data: { error?: string; data?: RowDataPacket[] }) => void;
  };  
}
app.post('/api/collectCustomerOrders', async (req: Request & RequestIDOrders, res: Response & CustomerItemsResponse) => {
  try {
    const userID = req.body.userID
    const sql = 'SELECT userName FROM users INNER JOIN orders ON users.userID WHERE users.userID = ?'

    const response = db.execute(sql, [userID]) as unknown as RowDataPacket[]
    
    res.status(200).json({ data: response})

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//////////////////////////////////////////
app.post('/api/getUsers', async (req, res) => {
  try {
    const sql = 'SELECT userID, userName FROM userData'
    db.execute(sql, (err, results) => {
      if (err){
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error'})
      } else {
        res.status(200).json({ data: results})
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const storage = multer.diskStorage({ 
  desination: path.join(__dirname, 'StoreImages'),
  filename: (req,file,cb)=> {
    cb(null, file.originalName)
  }
})
app.use(express.urlencoded({ extended: true}))
app.post('/api/createItem', upload.single('picture'), async (req, res) => {
  try {
    if (!req.file){
      res.status(500).json({ error: 'Internal Server Error'})
      return
    }
    const {title, description, price} = req.body
    const picturePath = req.file
    const sql = "INSERT INTO storeItems (itemName, itemDescription, itemPrice, imagePath) VALUES(?,?,?,?)"

    db.execute(sql, [ title, description, price, picturePath], (err, result) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error'})
      } else {
        res.status(200).json({ error: 'Success!'})
      }
    })
  } catch (error){
    res.status(500).json({ error: 'Internal Server Error'})
    console.log(error)
  }
})

app.post('/api/createOrder', async (req, res) => {
  try {
    console.log('order received')

    const userID = req.body.userID
    const userName = db.execute('SELECT userName FROM userData WHERE userID = ?', [userID])
    const itemIDs = req.body.cart
    const sql = 'INSERT INTO orders (userName, userID, itemID) VALUES (?,?,?)'

    await Promise.all(itemIDs.map(itemID => db.execute(sql, [userName, userID, itemID])))

    res.status(200).json({ message: 'Orders made'})
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

app.post('/api/removeItem', async (req, res) => {
  try {
    const itemID = req.body.storeItemID
    const sql = 'DELETE FROM storeItems WHERE itemID = ?'

    db.execute(sql, [itemID], (err, result) => {
      if (err){
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error'})        
      } else {
        res.status(200).json({ error: 'Yay'})  
      }
    })
  } catch (error){
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

app.post('/api/completeOrder',async (req, res) => {
  try {
    const sql = 'UPDATE orders SET completed = true WHERE orderID = ? AND userID = ?'
    const orderID = req.body.selectedCustomer
    const 
  }
})