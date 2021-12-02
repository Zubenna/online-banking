const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const auth = require("./routes/auth");
const trans = require("./routes/transactions");
const dotenv = require('dotenv');
dotenv.config('.env')

const app = express()

connectDB()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static("uploads"));

app.use('/api/bank', auth);
app.use('/api/transaction', trans);
app.set('view engine', 'ejs');
app.use('/css', express.static(path.resolve(__dirname, "public/css")));
app.use('/images', express.static(path.resolve(__dirname, "public/images")));
app.use('/styles', express.static(path.resolve(__dirname, "public/styles")));
app.use('/js', express.static(path.resolve(__dirname, "public/js")));
app.use('/script', express.static(path.resolve(__dirname, "public/script")));


app.get('/', (req, res) => {
    res.redirect('/api/bank')
});

app.listen( process.env.PORT || 3000, () => {
})