const mongoose = require("mongoose");
var bcrypt = require('bcrypt');
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());

const { User } = require("./models/UserModel");

app.get("/api/", async (req, res) => {
  return res.json({ msg: "hello crowdContract user" });
});

app.post("/api/users/login", async (req, res) => {
  const name = req.body["name"];
  const cryptPassword = req.body["password"];

  await User.findOne({name: name}).exec().then((user) => {
    if(user === null) return res.status(401).json({msg:"user not found"});
    if(name === user.name){
      console.log("user",user);
      //implement jwt
      if(cryptPassword === user.password) return res.json({jwt:"jwt"});
    }
    return res.status(401).json({msg: "invalid username or password"})
  });


});

app.get("/api/users", async (req, res) => {
  const allUsers = await User.find();
  return res.status(200).json(allUsers);
});

app.get("/api/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  return res.status(200).json(user);
});

app.post("/api/users/add", async (req, res) => {
  
  const newUser = new User({ ...req.body });
  const savedUser = await newUser.save();
  return res.status(201).json(savedUser);
});

app.put("/api/users/update/:id", async (req, res) => {
  const { id } = req.params;
  await User.updateOne({ id }, req.body);
  const updatedUser = await User.findById(id);
  return res.status(200).json(updatedUser);
});

app.delete("/api/users/delete/:id", async (req, res) => {
  const { id } = req.params;
  const deletedUser = await User.findByIdAndDelete(id);
  return res.status(200).json(deletedUser);
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