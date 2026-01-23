import express from 'express';
import morgan from 'morgan';

import fs from 'node:fs/promises';
import path from 'node:path';

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/railnet', async (req, res) => {
    const body = req.body;

    const filename = path.join('data', 'railnet', `${new Date().getTime()}-combined.json`);

    await fs.writeFile(filename, body, { encoding: 'utf8' });

    res.status(200).send('OK');
})

app.listen(9123, '127.0.0.1', (err) => {
    if (err) {
        throw err;
    }

    console.log(`Listening on http://localhost:9123`);
});
