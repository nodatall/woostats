const fs = require('fs')

const dataFilePath = __dirname + '/db.json'

function get(key) {
  const rawData = fs.readFileSync(dataFilePath)
  return key ? JSON.parse(rawData)[key] : JSON.parse(rawData)
}

function set(key, value) {
  const dataFile = get()
  dataFile[key] = value
  cache = dataFile
  fs.writeFileSync(dataFilePath, JSON.stringify(dataFile, null, 2))
}

module.exports = { get, set }
