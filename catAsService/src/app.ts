import express, { NextFunction, Request, Response } from 'express';
import { catastroRouter } from './catastro.router';

const app = express();
const port = 3000;

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.originalUrl)
    next()
});

app.use('/', catastroRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})