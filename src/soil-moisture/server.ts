import cors from 'cors';
import express from 'express';
import path from 'path';
import { Observable } from 'rxjs';

import { HznParams, Params } from '../common/params';

export class Server {
  params: Params = <Params>{};
  app = express();
  apiUrl = `${process.env.SERVERLESS_ENDPOINT}`
  constructor(private port = 80) {
    this.initialise()
  }

  getParams(params: HznParams) {
    return Object.assign(this.params, params)
  }
  setCorsHeaders(req: express.Request, res: express.Response) {
    res.header("Access-Control-Allow-Origin", "YOUR_URL"); // restrict it to the required domain
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    // Set custom headers for CORS
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");

  }
  streamData(req: express.Request, res: express.Response, parse = true) {
    let params = this.getParams(req.query as unknown as HznParams);
    let body = ''
    return new Observable((observer) => {
      req.on('data', (data) => {
        body += data
      })
      .on('close', () => {
        try {
          // console.log(body)
          let data = JSON.parse(body);
          if(!parse) {
            params.body = data
          } else {
            Object.keys(data).forEach((key) => {
              params[key] = data[key];
            })
          }
          observer.next(params)
          observer.complete()
        } catch(e) {
          observer.error(e)
        }
      })
    })
  }

  initialise() {
    let app = this.app;
    app.use(cors({
      origin: '*'
    }));
  
    app.use('/static', express.static('public'));

    app.use('/', express.static('dist/liquid-prep-dashboard'))
  
    app.get('/', (req: express.Request, res: express.Response, next: any) => { //here just add next parameter
      res.sendFile(
        path.resolve(__dirname, "index.html")
      )
      // next();
    })
  
    app.get("/staff", (req: express.Request, res: express.Response) => {
      res.json(["Jeff", "Joe", "John", "Mikio", "Rob", "Sanjeev", "Susan"]);
    });
  
    app.post('/update_config', (req: express.Request, res: express.Response, next) => {
      this.streamData(req, res)
      .subscribe({
        next: (params: Params) => {
          console.log(params)
          res.send('test')
          //this.cosClient.mkdir(params)
          //.subscribe({
          //  next: (data: any) => res.send(data),
          //  error: (err: any) => next(err)
          //})
        }, error: (err) => next(err)
      })
    })

    app.listen(this.port, () => {
      console.log(`Started on ${this.port}`);
    });
  }
}
