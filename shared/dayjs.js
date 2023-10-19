const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)

module.exports = dayjs
