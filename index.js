require('dotenv').config();
const express = require('express');
const db = require('./config/dbconn');
const router = require('./routes/routes');
const bodyParser = require('body-parser');
const jwt =require ("jsonwebtoken")
const path = require('path');
const {
    genSalt,
    hash,
    compare
} = require('bcrypt');
// express app
const app = express();
// Router

const port = parseInt(process.env.PORT) || 4000;
app.use(router, express.json(), express.urlencoded({
    extended: true
}));

let staticPath = path.join(__dirname + "/public")
app.use(express.static(staticPath));

app.get('/', (req, res,next ) => {
    res.sendFile(path.join(staticPath, 'index.html'));
})

app.listen(port, ()=> {
    console.log(`http://localhost:${port}`);
})

// User registration
app.post('/register', bodyParser.json(), async (req, res) => {
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
               alert:"Email Exists"
            });
        } else {
            // Encrypting a password
            // Default genSalt() is 10`
            bd.password = await hash(bd.password, 10);
            // bd.id = await hash(bd.id, 10);

            // Query
            const strQry =
                `
    INSERT INTO users(fullName, phoneNumber, joinDate, email, password)
    VALUES(?, ?, ?, ?, ?);
    `;
            //
            db.query(strQry,
                [bd.fullName, bd.phoneNumber, bd.joinDate, bd.email, bd.password],
                (err, results) => {
                    if (err) throw err;
                    res.send(`you have registered successfully: ${results.affectedRows}`)
                    // res.send(window.location.href="login.html")
                    // res.sendFile(__dirname + "/login.html")
                    ;
                })
            }
        }
        )
    })

    //view all mysql data from users in localhost 
    router.get('/users',(req,res)=>{
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

    app.post("/login", bodyParser.json(), (req, res) => {
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
 router.get('/login',(req,res)=>{
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

    //frontend 
    login: async (context, payload) => {
        const {
          email,
          password
        } = payload;
        fetch("http://localhost:3000/login", {
            method: "POST",
            body: JSON.stringify({
              email: email,
              password: password
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              "x-auth-token": ""
            },
          })
          .then((response) => response.json())
          .then((data) => {
            alert(data.msg)
            let userData = data
            context.commit("setUser", userData);
          })
      }

      //verify
      router.get ('/verify',(req,res)=>{
        const token = req.header("x-auth-token"
        );
        jwt.verify(token, process.env.jwtSecret,(error, decodedToken)=>{
            if (error){
                res.status(401).json({
                    msg:"you dont have access to this , sorry !",
                });
                
                }else{
                    res.status(200);
                    res.send(decodedToken);
            }
        });
      });

      const middleware = require("./middleware/auth");

      router.get("/",middleware,(req,res)=>{
        try{
        let sql = "SELECT * FROM users";
        con.query(sql, (err , result )=>{
            if (err)throw err;
            res.send(result);
        });
    } catch (error){
        console.log(error);
    }
      });

      // Delete product
router.delete('/products/:id', (req, res) => {
    // Query
    const strQry =
        `
    DELETE FROM products 
    WHERE id = ?;
    `;
    db.query(strQry, [req.params.id], (err, data, fields) => {
        if (err) throw err;
        res.send(`${data.affectedRows} row was affected`);
    })
});

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
        msg: "You forgot your password"
    })
});
