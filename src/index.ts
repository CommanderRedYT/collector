import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

import fs from 'node:fs/promises';
import path from 'node:path';

const configJson = 'apikeys.json';

dotenv.config({
    path: '.env.local',
});

const DATA_DIR = process.env.DATA_DIR;

if (!DATA_DIR) {
    throw new Error('Invalid DATA_DIR environment variable');
}

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let collectors: Record<string, string[]> = {};

app.post('/:collectorId', async (req, res) => {
    const xApiKey = req.headers['x-api-key'];
    const collectorId = req.params.collectorId;

    if (!xApiKey || typeof xApiKey !== 'string') {
        return res.status(400).send({
            error: 'Missing API key'
        });
    }

    if (!collectorId || typeof collectorId !== 'string') {
        return res.status(400).send({
            error: 'Missing Collector ID'
        });
    }

    // collectorId may only include a-zA-Z0-9
    if (!(/^[a-zA-Z0-9]+$/.test(xApiKey))) {
        return res.status(400).send({
            error: 'Missing Collector ID'
        });
    }

    if (!collectors[collectorId]) {
        return res.status(400).send({
            error: 'Missing Collector ID'
        })
    }

    const apiKeys = collectors[collectorId];

    if (!apiKeys.includes(xApiKey)) {
        return res.status(400).send({
            error: 'Missing API key',
        })
    }

    const body = req.body;

    const filename = path.join(DATA_DIR, collectorId, `${new Date().getTime()}.json`);

    await fs.mkdir(path.dirname(filename), { recursive: true });
    await fs.writeFile(filename, JSON.stringify(body), { encoding: 'utf8' });

    res.status(200).send('OK');
});

const main = async () => {
    if (!DATA_DIR) {
        throw new Error('Invalid DATA_DIR environment variable');
    }

    try {
        const file = await fs.readFile(configJson, 'utf8');
        collectors = JSON.parse(file);
    } catch (error) {
        await fs.writeFile(configJson, '{}', { encoding: 'utf8' });
        collectors = {};
    }

    app.listen(9123, '127.0.0.1', (err) => {
        if (err) {
            throw err;
        }

        console.log(`Listening on http://127.0.0.1:9123`);
    });
};

main();
