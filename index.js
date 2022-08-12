require('dotenv').config();
const express = require('express');
const db = require('./config/dbconn');
const router = require('./routes/routes');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken")
const path = require('path');
const {
  genSalt,
  hash,
  compare
} = require('bcrypt');
const middleware = require('./middleware/auth');
const { post } = require('./routes/routes');
// express app
const app = express();
// Router
const port = parseInt(process.env.PORT) || 4000;

// Set header
app.use((req, res, next)=>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use(router, express.json(), express.urlencoded({
  extended: true
}));

let staticPath = path.join(__dirname + "/public")
app.use(express.static(staticPath));

// app.get('/', (req, res, next) => {
//   res.sendFile(path.join(staticPath, 'index.html'));
// })

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})

// User registration
app.post('/users', bodyParser.json(), async (req, res) => {
  const bd = req.body;
  if (bd.userRole === "" || bd.userRole === null) {
    bd.userRole = "user";
  }
  const emailQ = "SELECT email from users WHERE ?";
  let email = {
    email: bd.email
  }
  db.query(emailQ, email, async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({
        alert: "Email Exists"
      });
    } else {
      // Encrypting a password
      // Default genSalt() is 10`
      bd.password = await hash(bd.password, 10);
      bd.joinDate = `${new Date().toISOString().slice(0, 10)}`;
      // bd.id = await hash(bd.id, 10);

      // Query
      const strQry =
        `
    INSERT INTO users(fullName, phoneNumber, joinDate, email, password,userRole)
    VALUES(?, ?, ?, ?, ?,?);
    `;
      //
      db.query(strQry,
        [bd.fullName, bd.phoneNumber, bd.joinDate, bd.email, bd.password, bd.userRole],
        (err, results) => {
          if (err) throw err;
          res.send(`you have registered successfully: ${results.affectedRows}`)
          // res.send(window.location.href="login.html")
          // res.sendFile(__dirname + "/login.html")
          ;
        })
    }
  })
})

//dumb text
// {
//   "fullName" : "eee",
//   "phoneNumber" : "222222",
//   "userRole" : "Admin",
//   "email" : "eeees@gmail.com",
//   "joinDate":"2022-11-11",
//   "password" : "dog"
// }

// admin delete a user
router.delete('/users/:id', middleware, async (req, res) => {
  // Query
  const strQry =
    `
  DELETE FROM users 
  WHERE id = ?;
  `;
  db.query(strQry, [req.params.id], (err, data, fields) => {
    if (err) throw err;
    res.send(`${data.affectedRows} successully deleted a user`);
  })
});

//update a user account
router.put('/users/:id', middleware, bodyParser.json(), async (req, res) => {
  const {
    fullName,
    phoneNumber,
    email,
    joinDate,
    password
  } = req.body

  let sql = `UPDATE users SET ? WHERE id = ${req.params.id} `

  const users = {
    fullName,
    phoneNumber,
    email,
    joinDate,
    password,
  }

  db.query(sql, users, (err, result) => {
    if (err) throw Error
    res.send(result)
  })

});



//view all mysql data from users in localhost 
router.get('/users', (req, res) => {
  const strQry =
    `
        SELECT *
        FROM users;
        `;
  db.query(strQry, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      results: results
    })
  })
})
//view all mysql data from users  by id in localhost 
router.get('/users/:id', (req, res) => {
  const strQry =
    `
        SELECT *
        FROM users
        
        WHERE id = ${req.params.id};
        `;
  db.query(strQry, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      results: results
    })
  })
})
//view all mysql data from products  by id in localhost 
router.get('/products/:id', (req, res) => {
  const strQry =
    `
        SELECT *
        FROM products
        
        WHERE productid = ${req.params.id};
        `;
  db.query(strQry, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      results: results
    })
  })
})
router.patch("/login", bodyParser.json(), (req, res) => {
  try {
    // Get email and password
    const {
      email,
      password
    } = req.body;
    const strQry = `
              SELECT *
              FROM users 
              WHERE email = '${email}';
              `;
    db.query(strQry, async (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        res.json({
          msg: "Email not found, Please Register"
        });
      } else {
        console.log(results)
        const ismatch = await compare(password, results[0].password);
        // res.json({
        //   results: await compare(password, results[0].password),
        //   // ? results
        //   // : "You provided a wrong password",
        // });
        // res.send(results),
        if (ismatch === true) {
          const payload = {
            user: {
              id: results[0].id,
              fullName: results[0].fullName,
              phoneNumber: results[0].phoneNumber,
              email: results[0].email,
              userRole: results[0].userRole,
            },
          };
          jwt.sign(
            payload,
            process.env.jwtSecret, {
              expiresIn: "365d",
            },
            (err, token) => {
              res.header({
                'x-auth-token': token
              })
              if (err) throw err;
              res.json({
                user: payload.user,
                token: token,
                msg: "Login Successful"

              });
              // res.json(payload.user);
            }
          );
        } else {
          res.json({
            msg: "You entered the wrong password"
          });
          // res.send("You entered the wrong password");
        }
      }
    });
  } catch (e) {
    console.log(`From login: ${e.message}`);
  }
});
//view all mysql data from users in localhost from login 
router.get('/login', (req, res) => {
  const strQry =
    `
    SELECT *
    FROM users;
    `;
  db.query(strQry, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      results: results
    })
  })
})

//token

//verify
router.get('/verify', (req, res) => {
  const token = req.header("x-auth-token");
  jwt.verify(token, process.env.jwtSecret, (error, decodedToken) => {
    if (error) {
      res.status(401).json({
        msg: "you dont have access to this , sorry !",
      });

    } else {
      res.status(200);
      res.send(decodedToken);
    }
  });
});


// router.get("/", (req, res) => {
//   try {
//     let sql = "SELECT * FROM users";
//     db.query(sql, (err, result) => {
//       if (err) throw err;
//       // res.send(req.user)
//       res.send(result);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

// admin delete a product
router.delete('/products/:id', middleware, async (req, res) => {
  // Query
  const strQry =
    `
    DELETE FROM products 
    WHERE productid = ?;
    `;
  db.query(strQry, [req.params.id], (err, data, fields) => {
    if (err) throw err;
    res.send(`${data.affectedRows} successully deleted a product`);
  })
});

//admin added a product

router.post('/products', middleware, bodyParser.json(), async (req, res) => {
  const bd = req.body;
  // Query
  const strQry =
    `
INSERT INTO products(title, genre, description, img, price,quantity,createdby)
VALUES(?, ?, ?, ?, ?,?,?);

`;
  db.query(strQry, [bd.title, bd.genre, bd.description, bd.img, bd.price, bd.quantity, bd.createdby], (err, data) => {
    if (err) throw err;
    res.send(`${data.affectedRows}Successfully added a product`);
  })
});

//update a product
router.put('/products/:id', middleware, bodyParser.json(), async (req, res) => {
  const {
    title,
    genre,
    description,
    img,
    price,
    quantity
  } = req.body

  let sql = `UPDATE products SET ? WHERE productid = ${req.params.id} `

  const product = {
    title,
    genre,
    description,
    img,
    price,
    quantity
  }

  db.query(sql, product, (err, result) => {
    if (err) throw Error
    res.send(result)
  })

});

//dumb text to add
// {
//   "title":"rainbowsiegexbox",
//   "category":"Shooter",
//   "description":"Rainbow Six: Siege is an intense, new approach to the first-person multiplayer shooter experience. Choose from a variety of unique elite Operators and master their abilities as you lead your team through tense, thrilling, and destructive team-based combat.",
//   "img":"https://i.postimg.cc/fRf3Y40M/rainbowsiegexbox.jpg",
//   "price":"299.00",
//   "quantity":"5"
// }

//view all mysql data from products in localhost 
router.get('/products', (req, res) => {
  const strQry =
    `
  SELECT *
  FROM products;
  `;
  db.query(strQry, (err, results) => {
    if (err) throw err;
    res.json({
      status: 200,
      results: results
    })
  })
})


//add to cart

// cart functionalty
// ===========================================================================================
// get cart items from user
router.get("/users/:id/cart", middleware, (req, res) => {
  try {
    const strQuery = "SELECT cart FROM users WHERE id = ?";
    db.query(strQuery, [req.user.id], (err, results) => {
      if (err) throw err;
        (function Check(a, b) {
          a = parseInt(req.user.id);
          b = parseInt(req.params.id);
          if (a === b) {
            // res.json({
            //   status: 200,
            //   result: results,
            // });
            res.send(results[0].cart);
          } else {
            res.json({
              msg: "Please Login",
            });
          }
        })();
    })
  } catch (error) {
    throw error;
  }
});

// add cart items
router.post("/users/:id/cart", middleware, bodyParser.json(), (req, res) => {
  try {
    let {
      id
    } = req.body;
    const qCart = ` SELECT cart
    FROM users
    WHERE id = ?;
    `;
    db.query(qCart, req.user.id, (err, results) => {
      if (err) throw err;
      let cart;
      if (results.length > 0) {
        if (results[0].cart === null) {
          cart = [];
        } else {
          cart = JSON.parse(results[0].cart);
        }
      }
      const strProd = `
    SELECT *
    FROM products
    WHERE productid = ${id};
    `;
      db.query(strProd, async (err, results) => {
        if (err) throw err;

        let product = 
        {
        productid: results[0].productid,
        title: results[0].title,
        genre: results[0].genre,
        description: results[0].desrciption,
        price: results[0].price,
        img: results[0].img,
        quantity:results[0].quantity,
        creatdby: results[0].createdby,
        };

        cart.push(product);
        // res.send(cart)
        const strQuery = `UPDATE users
    SET cart = ?
    WHERE (id = ${req.user.id})`;
        db.query(strQuery, /*req.user.id */ JSON.stringify(cart), (err) => {
          if (err) throw err;
          res.json({
            results,
            msg: "Product added to Cart",
          });
        });
      });
    });
  } catch (error) {
    console.log(error.message);
  }
//dumb text to test out
  // {
  
  //   "id":18
  // }

});

// delete products from cart
// router.delete("/users/:id/cart", middleware, (req, res) => {
//   const dCart = `SELECT cart 
//   FROM users
//   WHERE id = ?`

//   db.query(dCart, req.user.id, (err, results) => {
//     if (err) throw err
//     let cart
//     if (results[0].cart === null) {
//       cart = [];
//     } else {
//       cart = JSON.parse(results[0].cart);
//     }

//     for (let i = 0; i < cart.length; i++) {
//       let index = cart.indexOf(cart[i].id)
//       cart.splice(index, 1)

//     }
//   })
//   const strQry = `
//   UPDATE users
//     SET cart = null
//     WHERE (id = ?);
//     `;
//   db.query(strQry, [req.user.id], (err, data, fields) => {
//     if (err) throw err;
//     res.json({
//       msg: "Item Deleted",
//     });
//   });
// });

router.delete("/users/:id/cart", middleware,(req, res) => {
  const dCart = `SELECT cart 
  FROM users
  WHERE id = ?`

  db.query(dCart, req.user.id, (err, results) => {
    // let cart = 
  })
  const strQry = `
  UPDATE users
    SET cart = null
    WHERE (id = ?);
    `;
  db.query(strQry, [req.user.id], (err, data, fields) => {
    if (err) throw err;
    res.json({
      msg: "Item Deleted",
    });
  });
})

//delete single product in cart

router.delete("/users/:id/cart/:productid",middleware,(req,res)=>{
  const dCart = `SELECT cart 
  FROM users
  WHERE id = ?`

  db.query(dCart,req.user.id,(err,results)=>{
if(err) throw err
  let var1 = JSON.parse(results[0].cart).filter((x)=>{return x.productid != req.params.productid;
  })
  const strQry = `
  UPDATE users
  SET cart = ?
  WHERE (id= ?) ;
  `;
  db.query(strQry, [JSON.stringify(var1),req.user.id], (err, data, fields) => {
    if (err) throw err;
    res.json({
      msg: "Item  single Deleted",
    });
  });
})
})



//update to cart 


//USERS FORGOT PASSWORD

router.post("/forgot-password", (req, res) => {
  try {
    let sql = "SELECT * FROM users WHERE ?";
    let user = {
      email: req.body.email,
    };
    con.query(sql, user, (err, result) => {
      if (err) throw err;
      if (result === 0) {
        res.status(400), res.send("Email not found");
      }
      // Allows a connection to the email given
      const transporter = nodemailer.createTransport({
        host: process.env.MAILERHOST,
        port: process.env.MAILERPORT,
        auth: {
          user: process.env.MAILERUSER,
          pass: process.env.MAILERPASS,
        },
      });
      console.log(transporter);
      // How the mail should be sent out
      const mailData = {
        from: process.env.MAILUSER,
        to: result[0].email,
        subject: "Password Reset",
        html: `<div>
                <h3>Hi ${result[0].full_name},</h3>
                <br>
                <h4>Click link below to reset your password</h4>
                <a href="http://localhost:6969/new-psw.html">
                  Click Here to Reset Password
                  user_id = ${result[0].user_id}
                </a>
                <br>
                <p>For any queries feel free to contact us...</p>
                <div>
                  Email: ${process.env.MAILERUSER}
                  <br>
                  Tel: If needed you can add this
                <div>
              </div>`,
      };
      // Checks if the email can be sent
      // Checks given email in the .env file
      transporter.verify((error, success) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email valid! ", success);
        }
      });
      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          res.send("Please check your email");
        }
      });
    });
  } catch (error) {
    console.log(error);
  }

  res.status(401).json({
    msg: "You forgot your paseesword"
  })
});
module.exports = {
  devServer: {
      Proxy: '*'
  }
}
