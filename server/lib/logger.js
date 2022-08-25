const winston = require('winston')
const { format, transports, createLogger } = winston
const { errors, combine, colorize, timestamp, align, printf } = format

const logger = createLogger({
  level: 'debug',
  format: combine(
    colorize(),
    timestamp(),
    align(),
    errors({ stack: true }),
    printf((debug) => {
      const { timestamp, level, message, ...args } = debug
      const ts = timestamp.slice(0, 19).replace('T', ' ')
      return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`
    }),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'error.log',
      level: 'error',
    }),
  ],
})

logger.msg = function(msg) {
  const msgString = JSON.stringify(msg)
  if (msgString.length < 200) return msgString
  return msgString.slice(0, 200) + '...'
}

module.exports = logger
