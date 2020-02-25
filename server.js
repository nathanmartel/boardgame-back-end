require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pg = require('pg');
// Application Setup
const app = express();

app.use(express.json());
//read incoming json data
app.use(express.urlencoded({ extended: true }));
//parsing application
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.static('public')); // server files from /public folder

const Client = pg.Client;
const client = new Client(process.env.DATABASE_URL);
client.connect();
//connect to database client

const PORT = process.env.PORT || 3000;

app.get('/api/games', async(req, res) => {
    try { 
        const results = await client.query(`
        SELECT * FROM games
        JOIN publishers 
        ON games.publisher_id = publishers.id
        ORDER BY games.name;
    `);
       //select all from games
       //get publishers table publisher name
       //join tables on matching _id and .id
       //order game table by name
        res.json(results.rows);
    }
    catch (err){
        console.log(err);
    }
});
app.get('/', async(req, res) => {
    try { 
       
        res.send('home page!');
    }
    catch (err){
        console.log(err);
    }
});

app.post('/api/games', async(req, res) => {
    try {
        const results = await client.query(`
        INSERT INTO ${process.env.DB_NAME} (name, year, image_url, price, publisher_id, categories, min_players, max_players, have_played)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)   
        RETURNING *;
    `,
        [req.body.name, req.body.year, req.body.image_url, req.body.price, req.body.publisher_id, req.body.categories, req.body.min_players, req.body.max_players, req.body.have_played]);
        
        res.json(results.rows);       
    }
    catch (err){
        console.log(err);
    }
});
app.delete(`/api/games/:id`, async(req, res) => {
    try {
        const results = await client.query(`
        DELETE FROM ${process.env.DB_NAME} WHERE id=$1;
    `,  
        [req.params.id]);
        //req.params relates to :id in URL /games/:id
        res.json(results.rows);       
    }
    catch (err){
        console.log(err);
    }
});

app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});