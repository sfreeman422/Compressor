import bodyParser from 'body-parser';
import express, { Application } from 'express';

const app: Application = express();
const PORT = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(PORT, (e: Error) => {
  e ? console.error(e) : console.log('Listening on port 3000');
});
