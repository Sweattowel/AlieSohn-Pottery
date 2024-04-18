import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import { createRequire } from "module";
import multer from "multer";
import path, { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import jwt from 'jsonwebtoken'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const db = mysql.createConnection({
  connectionLimit: 10,
  host: process.env.REACT_APP_DATABASE_HOST,
  user: process.env.REACT_APP_DATABASE_USER,
  password: process.env.REACT_APP_DATABASE_PASSWORD,
  database: process.env.REACT_APP_DATABASE_DATABASE,
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

///////////////////////////////////////////////////////// IMAGE STORAGE DIRECTORY DEFINITION
app.use("/StoreImages", express.static(path.join(__dirname, "StoreImages")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "StoreImages"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

///////////////////////////////////////////////////////// AUTHENTICATION AND REGISTRATION SECTION
// Token check, to be reused in multiple functions
const CheckToken = async (token) => {
  try {
    const decoded = jwt.verify(token, 'privatekey')
    return true
  } catch (error) {
    console.log(error) 
    return false
  }
}
// Registration
const bcrypt = require("bcrypt");

app.post("/api/register", async (req, res) => {
  try {
    console.log("Received Registration attempt");

    const userName = req.body.userName;
    const passWord = req.body.passWord;

    const sql = "SELECT * FROM userData WHERE userName = ?";
    db.execute(sql, [userName], async (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
      } else if (results.length > 0) {
        res
          .status(409)
          .json({ error: "Invalid username: data already exists" });
      } else if (results.length == 0) {
        const sql2 = "INSERT INTO userData (userName, passWord) VALUES (?, ?)";
        const hashedPassword = await bcrypt.hash(passWord, 10);
        db.execute(sql2, [userName, hashedPassword], (err, results) => {
          if (err) {
            res.status(500).json({ error: "Internal server error" });
          } else {
            res.status(200).json({ message: "Successfully registered" });
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// REGULAR USER LOGIN

app.post("/api/login", async (req, res) => {
  try {
    const sql =
      "SELECT userID, userName, passWord FROM userData WHERE userName = ?";
    const userName = req.body.userName;
    const passWord = req.body.passWord;
    console.log("Received login attempt", userName);

    db.execute(sql, [userName], async (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Server Failure" });
      } else if (results.length !== 1) {
        console.log("Invalid username or password");
        res.status(401).json({ error: "Invalid username or password" });
      } else {
        const user = results[0];
        const hashedPassword = user.passWord;

        try {
          const passwordMatch = await bcrypt.compare(passWord, hashedPassword);
          if (passwordMatch) {
            console.log("Login success");
            const userID = user.userID;
            const userName = user.userName;
            jwt.sign({ userID, userName }, 'privatekey', {expiresIn: '1h'}, (err, token) => {
              if (err){
                console.log(err)
                res.status(500).json({ error: "Internal Server Error" });
              } else {
                res.status(200).json({ message: 'Successfully logged in', token, userID, userName})
              }
            })
          } else {
            console.log("Invalid username or password");
            res.status(401).json({ error: "Invalid username or password" });
          }
        } catch (compareError) {
          console.log(compareError);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// REGULAR USER ACCOUNT REMOVAL

app.post("/api/deleteAccount", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const isValid = await CheckToken(token)
  if (!isValid || !token){
    console.log('Failed to validate')
    res.status(401).json({ error: "Unauthorized" });
    return
  }       
  try {
    const { userID, userName } = req.body;

    // Check if both userID and userName are provided
    if (!userID || !userName) {
      return res
        .status(400)
        .json({ error: "Both userID and userName are required" });
    }

    const sql = "SELECT * FROM userData WHERE userID = ? AND userName = ?";
    db.execute(sql, [userID, userName], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length !== 1) {
        return res.status(404).json({ error: "User not found" });
      }

      const deleteOrdersSql =
        "DELETE FROM orders WHERE userID = ?";
      db.execute(deleteOrdersSql, [userID], (err, orderDeleteResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        const deleteUserSql = "DELETE FROM userData WHERE userID = ?";
        db.execute(deleteUserSql, [userID], (err, userDeleteResult) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
          }

          res.status(200).json({ message: "Account successfully deleted" });
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// SUPERUSER REGISTRATION DETAILS
// SUPERUSER CREATION
app.post("/api/adminRegistration", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const isValid = await CheckToken(token)
  if (!isValid || !token){
    console.log('Failed to validate')
    res.status(401).json({ error: "Unauthorized" });
    return
  }    
  try {
    const { userName, passWord } = req.body;
    const searchSQL = 'SELECT * FROM admins WHERE userName = ?'
    db.execute(searchSQL, [userName], async (err, results) => {
      if (results.length > 0){
        res.status(400).json({ error: 'Incorrect'})
      } else {
        const hashedPassword = await bcrypt.hash(passWord, 10);

        const sql = "INSERT INTO admins (userName, passWord) VALUES (? , ?)";
    
        db.execute(sql, [userName, hashedPassword], (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            res.status(200).json({ message: "ADMIN SUCCESSFULLY MADE" });
          }
        });
      }
    })
  

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// SUPERUSER LOGIN
app.post("/api/adminLogin", async (req, res) => {
  try {
    console.log("Received admin login attempt");
    const sql = "SELECT * FROM admins WHERE userName = ?";
    const userName = req.body.userName;
    const passWord = req.body.passWord;

    db.execute(sql, [userName], async (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      } else if (results.length !== 1) {
        console.log("No admin user exists with this username");
        res
          .status(404)
          .json({ error: "No admin user exists with this username" });
      } else {
        const admin = results[0];
        const hashedPassword = admin.passWord;

        try {
          const passwordMatch = await bcrypt.compare(passWord, hashedPassword);
          if (passwordMatch) {
            console.log("Admin login success");
            const adminID = admin.adminID;
            jwt.sign({adminID}, 'privatekey', {expiresIn: '1h'}, (err, token) => {
              if (err){
                res.status(500).json({ error: "Internal Server Error" });
              } else {
                res
                .status(200)
                .json({ message: "Successfully logged in", adminID, token });
              }
            })
          } else {
            console.log("Invalid admin username or password");
            res
              .status(401)
              .json({ error: "Invalid admin username or password" });
          }
        } catch (compareError) {
          console.log(compareError);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

///////////////////////////////////////////////////////// STOREDATA COLLECTION

app.post("/api/storeItems", async (req, res) => {
  console.log("Request received for storeData");
  try {
    const sql = "SELECT * FROM storeItems";
    db.execute(sql, (err, results) => {
      if (err) {
        console.log(err);
      } else if (results.length === 0) {
        res.status(404).json({ error: "No items available" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
///////////////////////////////////////////////////////// BROCHURE CREATOR
// BROCHURE CALL
let brochure = null;
const createBrochure = () => {
  console.log("Making Brochure");
  const sql =
    "SELECT storeItems.itemID, storeItems.itemName, storeItems.imagePath, storeItems.itemPrice, COUNT(orders.orderID) AS order_count FROM storeItems JOIN orders ON storeItems.itemID = orders.itemID GROUP BY storeItems.itemID, storeItems.itemName ORDER BY order_count DESC LIMIT 3;";
  db.execute(sql, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Brochure made");
      brochure = results;
    }
  });
};
// BROCHURE UPDATE SCHEDULING
const updateBrochure = () => {
  createBrochure();
  setInterval(createBrochure, 5 * 60 * 1000);
};
updateBrochure();

// BROCHURE DELIVERY

app.post("/api/getBrochure", async (req, res) => {
  console.log("Received Request for Brochure");
  try {
    if (brochure) {
      res.status(200).json(brochure);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
});
///////////////////////////////////////////////////////// ORDER HANDLING
// ORDER CREATION
app.post("/api/createOrder", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const isValid = await CheckToken(token)
  if (!isValid || !token){
    console.log('Failed to validate')
    res.status(401).json({ error: "Unauthorized" });
    return
  }    

  try {
 
    console.log("orders received");
    const {userID, userName, itemIDs} = req.body;
    const orderDate = new Date()
    const formattedDate = orderDate.toISOString().slice(0, 19).replace("T", " ")
    const sql =
      "INSERT INTO orders (userName, userID, itemID, orderDate) VALUES (? ,? ,?, ? )";

    for (const itemID of itemIDs) {
      await db.execute(sql, [userName, userID, itemID, formattedDate], (err, results) => {
        if (err){
          res.status(500).json({ error: "Internal Server Error" });
        }
      });
    }
    res.status(200).json({ message: "orders successfully placed" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ORDER COLLECTION

app.post("/api/getOrders", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const isValid = await CheckToken(token)
  if (!isValid || !token){
    console.log('Failed to validate')
    res.status(401).json({ error: "Unauthorized" });
    return
  }     
  
  try {
    const userID = req.body.userID;
    const sql = `SELECT storeItems.itemName, orders.itemID, orders.orderID, orders.orderDate, completed FROM orders LEFT JOIN storeItems ON storeItems.itemID = orders.itemID WHERE userID = ?`;

    db.execute(sql, [userID], (err, results) => {
      if (err) {
        console.log(err);
      } else if (results.length === 0) {
        res.status(404).json({ message: "No orders for selected customer" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
///////////////////////////////////////////////////////// USER COLLECTION
app.post("/api/getUsers", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token){
    res.status(401).json({ error: "Unauthorized" });
    return
  }
  const isValid = await CheckToken(token)

  if (!isValid){
    res.status(401).json({ error: "Unauthorized" });
    return
  }  
  try {
    const sql = "SELECT userID, userName FROM userData";

    db.execute(sql, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(200).json({ data: results });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

///////////////////////////////////////////////////////// STORE ITEM HANDLING
// STORE ITEM CREATION

app.post("/api/CreateItem", upload.single("picture"), async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const isValid = await CheckToken(token)
  if (!isValid || !token){
    console.log('Failed to validate')
    res.status(401).json({ error: "Unauthorized" });
    return
  }    
  try {
    console.log("Received Admin storeRequest");
    if (!req.file) {
      res.status(404).json({ error: "No picture found" });
      return;
    }
    const { title, description, price } = req.body;
    const pictureFileName = req.file.filename.toLowerCase();
    const relativeImagePath = `./StoreImages/${pictureFileName.toLowerCase()}`;
    const sql =
      "INSERT INTO storeItems (itemName, itemDescription, itemPrice, imagePath) VALUES (?,?,?,?)";

    db.execute(
      sql,
      [title, description, price, relativeImagePath],
      (err, result) => {
        if (err) {
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.status(200).json({ message: "StoreItem successfully made" });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
import fs from "fs";
import { rejects } from "assert";

// STORE ITEM REMOVAL

app.post("/api/removeItem", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const isValid = await CheckToken(token)
  if (!isValid || !token){
    console.log('Failed to validate')
    res.status(401).json({ error: "Unauthorized" });
    return
  }    
  try {
    const itemID = req.body.storeItemID;
    const sql1 = "SELECT imagePath FROM storeItems WHERE itemID = ?";

    const sql = "DELETE FROM storeItems WHERE itemID = ?";
    const sql2 = "DELETE FROM orders WHERE itemID = ?";

    db.execute(sql1, [itemID], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.log(result);
        const imagePath = result[0].imagePath;

        const imagePathOnServer = path.join(__dirname, imagePath);
        fs.unlinkSync(imagePathOnServer);
      }
    });
    db.execute(sql2, [itemID], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    db.execute(sql, [itemID], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    res.status(200).json({ message: "StoreItem successfully removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// ADMIN ORDER COMPLETION
app.post("/api/completeOrder", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const isValid = await CheckToken(token)
  if (!isValid || !token){
    console.log('Failed to validate')
    res.status(401).json({ error: "Unauthorized" });
    return
  }    
  try {
    const sql =
      "UPDATE orders SET completed = ? WHERE orderID = ? AND userID = ?";
    const orderID = req.body.orderID;
    const userID = req.body.selectedCustomer;
    const decision = req.body.decision;
    db.execute(sql, [decision, orderID, userID], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(200).json({ message: "Succesfully completed order" });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
