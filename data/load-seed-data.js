require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
const games = require('./boardgameData.json');
const publishers = require('./publishersData.json');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);
    //make request to gameboard database in heroku

    try {
        await client.connect();
        //connect to database
        // First save types and get each returned row which has
        // the id of the type. Notice use of RETURNING:
        //promise.all takes in array of promises and returns array of responses
        //doesnt move on till all done, more than one promise at once

        const savedPublishers = await Promise.all(
            publishers.publisherData.map(async publisher => {
                const result = await client.query(`
                    INSERT INTO publishers (name)
                    VALUES ($1)
                    RETURNING *;
                `,
                [publisher]);
                //create publishers table with name
                return result.rows[0];
            })
        );

        //executes all async tasks at once for each gameboard data
        await Promise.all(
            games.gameboardData.map(game => {
                // Find the corresponding type id
                // find the id of the matching publisher name
                const publisher = savedPublishers.find(publisher => {
                    return publisher.name === game.publisher;
                });
                //use publisherId to tie in cooresponding array parameter

                //first argument in function is key to value pair for parameters in query
                return client.query(`
                INSERT INTO ${process.env.DB_NAME} (name, year, image_url, price, publisher_id, categories, min_players, max_players, have_played)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
                `,
                [game.name, game.year, game.image_url, game.price, publisher.id, game.categories, game.min_players, game.max_players, game.have_played]);
                //second argument is array of values cooresponding to each parameter in query
            })
        );
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}

// INSERT INTO games (name, year, image_url, price, publisher, categories, min_players, max_players)
//    VALUES ("Gloomhaven", 2017, "https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1559254920151-51ulRXlJ7LL.jpg", 139.99, "Cephalofair Games", "cooperative", 1, 4);
