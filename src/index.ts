import express from 'express';
import morgan from 'morgan';

import fs from 'node:fs/promises';
import path from 'node:path';

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let apiKeys: string[] = [];

app.use((req, res, next) => {
    const xApiKey = req.headers['x-api-key'];

    if (!xApiKey || typeof xApiKey !== 'string') {
        return res.status(400).send({
            error: 'Missing API key'
        });
    }

    if (!apiKeys.includes(xApiKey)) {
        return res.status(400).send({
            error: 'Missing API key'
        })
    }

    next();
})

app.post('/railnet', async (req, res) => {
    const body = req.body;

    const filename = path.join('data', 'railnet', `${new Date().getTime()}-combined.json`);

    await fs.mkdir(path.dirname(filename), { recursive: true });
    await fs.writeFile(filename, JSON.stringify(body), { encoding: 'utf8' });

    res.status(200).send('OK');
})

const main = async () => {
    const file = await fs.readFile('apikeys.json', 'utf8');
    apiKeys = JSON.parse(file);

    app.listen(9123, '127.0.0.1', (err) => {
        if (err) {
            throw err;
        }

        console.log(`Listening on http://localhost:9123`);
    });
};

main();
