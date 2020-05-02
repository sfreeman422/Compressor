import express, { Request, Response, Router } from 'express';
// import { SlackService } from '../services/slack.service';
// import { WebService } from '../services/web.service';
import { EventRequest } from '../models/slack.model';

export const eventController: Router = express.Router();

// const webService = WebService.getInstance();
// const slackService = SlackService.getInstance();

eventController.post('/event/handle', (req: Request, res: Response) => {
  const request: EventRequest = req.body;
  console.log(request);
  console.time('respond-to-event');
  console.timeEnd('respond-to-event');
  res.send({ challenge: request.challenge });
});
