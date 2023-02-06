/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const expressWinston = require('express-winston');
const flash = require('express-flash');
const methodOverride = require('method-override');
const http = require('http');

const logger = require('./src/helpers/logger');
const routes = require('./server/webserver/routes');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH', 'OPTIONS'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const loggerMiddleware = expressWinston.logger(logger);

app.use(loggerMiddleware);

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    name: process.env.COOKIE_NAME,
    proxy: true,
    resave: true,
    saveUninitialized: true,
  }),
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(flash());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  // eslint-disable-next-line no-unused-vars
  methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  }),
);
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'Public')));

// register routes
routes(app, express);

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);
logger.info(`server listening on port: ${PORT}`);
httpServer.listen(PORT);
