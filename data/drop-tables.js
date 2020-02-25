require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();
        await client.query(`
        DROP TABLE IF EXISTS ${process.env.DB_NAME};
        DROP TABLE IF EXISTS publishers;

        `);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}