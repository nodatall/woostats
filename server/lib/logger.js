const winston = require('winston')

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((debug) => {
      const {
        timestamp, level, message, ...args
      } = debug

      const ts = timestamp.slice(0, 19).replace('T', ' ')
      return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'error.log',
      level: 'debug',
    }),
  ],
})

module.exports = logger
