const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;
const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;


app.set('view engine','ejs');

app.get('/book/:id',async(req,res) => {
    const bookId = req.params.id;
    const url = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${googleApiKey}`;

    try{
        const response = await axios.get(url);
        const bookData = response.data;

        if(!bookData){
            return res.status(404).send('Book not found');
        }

        res.render('book',{book:bookData});
    }catch(error){
        console.error(error);
        res.status(500).send('Error while retrieving data');
    }
});

app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`);
});