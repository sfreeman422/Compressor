import express, { Request, Response, Router } from 'express';
import { WebService } from '../services/web.service';
import { EventRequest } from '../models/slack.model';

export const eventController: Router = express.Router();

const webService = WebService.getInstance();

eventController.post('/event/handle', async (req: Request, res: Response) => {
  if (req.body.challenge) {
    res.send({ challenge: req.body.challenge });
  } else {
    // This 200 is necessary in order to acknowledge that we have received the event and are handling it.
    // Without this, we will receive duplicate notifications for the same events.
    res.sendStatus(200);
    const request: EventRequest = req.body;
    if (request.event.type === 'file_shared' && request.event.user_id && request.event.user_id !== 'U012YEAJ1PV') {
      console.log('New media uploaded by: ', request.event.user_id);
      await webService.startCompression(request.event.file_id, request.event.channel_id);
    }
  }
});
