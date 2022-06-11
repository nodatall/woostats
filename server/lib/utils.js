function toReadableNumber(
  decimals,
  number = '0'
){
  if (!decimals) return number

  const wholeStr = number.substring(0, number.length - decimals) || '0'
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, '0')
    .substring(0, decimals)

  return +`${wholeStr}.${fractionStr}`.replace(/\.?0+$/, '')
}

module.exports = {
  toReadableNumber,
}
