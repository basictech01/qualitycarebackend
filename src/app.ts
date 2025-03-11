import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import "reflect-metadata"
import { PORT } from '@utils/contants';
import createLogger from '@utils/logger';
import { errorHandler } from '@middleware/error';

import user from '@controller/user';
import service from '@controller/service';
import doctor from '@controller/doctor';
import booking from '@controller/booking';
import review from '@controller/review';
import notification from '@controller/notification';
import vat from '@controller/vat';
import loyalty from '@controller/loyalty';
import branch from '@controller/branch';
import banner from '@controller/banner';
import settings from '@controller/settings';

import pool from '@utils/db';

require("dotenv").config();
const logger = createLogger('@app')

async function start() {
    // Start server here
    const app: Application = express()
    app.use(bodyParser.json())
    app.use(cors());
    app.use(morgan('combined'))

    app.use('/user', user);

    app.use('/service', service);
    app.use('/doctor', doctor);
    app.use('/booking', booking);

    app.use('/review', review);
    app.use('/notification', notification);
    app.use('/vat', vat);
    app.use('/loyalty', loyalty);
    app.use('/branch', branch);
    app.use('/banner', banner);
    app.use('/settings', settings);

    app.use(errorHandler)
    const server = app.listen(PORT, function() {
        logger.info(`App is listening on port ${PORT} !`)
    })
}

start();

