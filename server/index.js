const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
var CryptoJS = require("crypto-js");
const getSecretsFromAwsSecretManager = require('./utils/getSecrets.js');

dotenv.config();
app.use(express.json());
app.use(cors());

const { User } = require("./models/UserModel");

// console.log(getSecretsFromAwsSecretManager("MONGO_URI"))
//Check to make sure header is not undefined, if so, return Forbidden (403)
const checkToken = (req, res, next) => {
  console.log(req.originalUrl)
  if (req.originalUrl === '/api/users/login') {
    console.log('Surpass JWT for login');
    return next();
  };
  
  const header = req.headers['authorization'];

  if(typeof header !== 'undefined') {
      const bearer = header.split(' ');
      const token = bearer[1];
      jwt.verify(token, process.env.JWT_SECRET_KEY
      , (err, authorizedData) => {
        if(err){
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            //If token is successfully verified, we can send the autorized data 
            req.token = token;
            if(req.body["userName"] !== authorizedData.name){
              console.log('User ',authorizedData.name,' dose not have access to this data!');
              return res.status(403).json({msg: "unauthorizedAccess"});
            }
            console.log('User ',authorizedData.name,' authenticated');
            return next();
        }
    })


  } else {
      //If header is undefined return Forbidden (403)

      return res.status(403).json({msg : "unauthorized"})
  }
}

app.use(checkToken);

app.get("/api/", async (req, res) => {
  return res.json({ msg: "hello crowdContract user" });
});

app.post("/api/users/login", async (req, res) => {
  const name = req.body["name"];
  const password = req.body["password"];

  await User.findOne({ name: name })
    .exec()
    .then((user) => {
      if (user === null) return res.status(401).json({ msg: "user not found" });
      //implement jwt
      if (name === user.name) {
        bcrypt.compare(password, user.password).then((result) => {
          if (result) {
            const jwtoken = jwt.sign(
              { name: user.name },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "1h" }
            );
            // console.log("jwt", jwtoken);
            var ciphertext = CryptoJS.AES.encrypt(
              JSON.stringify({ user: user }),
              process.env.AES_SECRET_KEY
            ).toString();
            return res
              .status(200)
              .json({ msg: "loginSuccess", jwt: jwtoken, user: ciphertext });
          } else {
            // JSON.stringify({msg: "invalid username or password"});
            return res
              .status(401)
              .json({ msg: "invalidAuth" });
          }
        });
      }
    });
});

app.get("/api/users", async (req, res) => {
  const allUsers = await User.find();
  return res.status(200).json({msg: "success",data: allUsers});
});

app.post("/api/users/getUser", async (req, res) => {
  const userName = req.body.userName;
  try {
    const user = await User.findOne({ name: userName });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(200).json({msg: "userNotFound"});
  }
});

app.post("/api/users/add", async (req, res) => {
  const newUser = new User({ ...req.body });
  const savedUser = await newUser.save();
  return res.status(201).json({msg: "success",data: savedUser});
});

app.put("/api/users/update/:id", async (req, res) => {
  const { id } = req.params;
  await User.updateOne({ id }, req.body);
  const updatedUser = await User.findById(id);
  return res.status(200).json({msg: "success",data: updatedUser});
});

app.delete("/api/users/delete/:id", async (req, res) => {
  const { id } = req.params;
  const deletedUser = await User.findByIdAndDelete(id);
  return res.status(200).json({msg: "success",data: deletedUser});
});


const startServer = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(
        app.listen(process.env.PORT, () =>
          console.log(`Server started on port ${process.env.PORT}`)
        )
      );
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

startServer();
