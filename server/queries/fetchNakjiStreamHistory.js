const { nakjiRequest } = require('../lib/nakji')
const dayjs = require('../lib/dayjs')

module.exports = async function fetchExchangeVolumeHistory({ streamName, to = dayjs().utc().unix() }) {
  return await nakjiRequest(
    `/data/${streamName}`,
    `&to=${to}`
  )
}
