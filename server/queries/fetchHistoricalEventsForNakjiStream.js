const { processNakjiMessage, nakjiRequest } = require('../lib/nakji')

module.exports = async function fetchHistoricalEventsForNakjiStream({ stream, from, to }) {
  let params = ''
  if (from) params += `&from=${from}`
  if (to) params += `&to=${to}`
  const result = await nakjiRequest({
    path: `/data/${stream}`,
    params,
  })

  const events = []
  result.split('\n').forEach(event => {
    if (event !== '') {
      events.push(
        processNakjiMessage({
          Data: JSON.parse(event),
          Event: stream,
        })
      )
    }
  })

  return events
}
