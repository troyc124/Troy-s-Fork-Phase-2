import { createLogger, format, transports } from "winston";
import {config} from 'dotenv';
import { info } from "console";

config(); //Load environment variables from .env file

const logLevel = process.env.LOG_LEVEL === '2' ? 'debug' : process.env.LOG_LEVEL === '1' ? 'info' : 'silent'; //gets the log level from the environment variable
const logSilent = process.env.LOG_LEVEL === '0' ? true : false;
const logFilePath = process.env.LOG_FILE || 'logs/default.log'; //gets the logfile path

const logger = createLogger({
    level: logLevel,
    silent: logSilent,
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), //Adds timestamp to the log
        format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`) //Formats the log message
    ),
    transports: [
        new transports.Console(), //Log to the console
        new transports.File({ filename: logFilePath }) //Log to the file in $LOG_FILE
    ]
});

export default logger;
