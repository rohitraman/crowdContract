const express = require('express');
const mongoose = require('mongoose');
const { Dog } = require('./models/models');
const dotenv = require('dotenv');
const cors =  require('cors');
const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());
app.get('/', async (req, res) => {
    return res.json({"msg": "hello brother"});
} );

app.get('/dogs', async (req, res) => {
    const allDogs = await Dog.find();
    return res.status(200).json(allDogs);
});

app.get('/dogs/:id', async (req, res) => {
    const id = req.params.id;
    const dog = await Dog.findById(id);
    return res.status(200).json(dog);
});

app.post('/dogs/add', async (req, res) => {
    const newDog = new Dog({...req.body});
    const insertdDog = await newDog.save();
    return res.status(201).json(insertdDog);
});

app.put("/dogs/update/:id", async (req, res) => {
  const { id } = req.params;
  await Dog.updateOne({ id }, req.body);
  const updatedDog = await Dog.findById(id);
  return res.status(200).json(updatedDog);
});

app.delete("/dogs/delete/:id", async (req, res) => {
  const { id } = req.params;
  const deletedDog = await Dog.findByIdAndDelete(id);
  return res.status(200).json(deletedDog);
});

const start = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(process.env.PORT,() => console.log(`Server started on port ${process.env.PORT}`));
    }catch(e){
        console.log(e);
        process.exit(1);
    }
}

start();