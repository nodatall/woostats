import { useEffect, useState } from 'react'

import dayjs from 'lib/dayjs'
import { useLocalStorage } from 'lib/storageHooks'

let rangeSetTimeout
let rangeSliderDebounce = null

export default function useDateRangeSliderHook({ length, title, defaultPeriod }) {
  const defaultRange = [defaultPeriod === -1 ? 1 : length - defaultPeriod, length]
  const [range = defaultRange, _setRange] = useState(defaultRange)
  const [
    lastRangeDate = dayjs.utc().format('YYYY-MM-DD'), setLastRangeDate
  ] = useLocalStorage(`${title}RangeSliderLastDate`)

  const setRange = (val, ignoreDebounce) => {
    if (rangeSliderDebounce && !ignoreDebounce) return
    rangeSliderDebounce = true
    _setRange(val)
    clearTimeout(rangeSetTimeout)
    rangeSetTimeout = setTimeout(() => {
      setLastRangeDate(dayjs.utc().format('YYYY-MM-DD'))
    }, 500)
    setTimeout(() => {
      rangeSliderDebounce = null
    }, 20)
  }

  useEffect(
    () => {
      const today = dayjs.utc(dayjs.utc().format('YYYY-MM-DD'))
      const daysAgo = today.diff(lastRangeDate, 'day')
      if (daysAgo > 0 && length - range[1] === daysAgo) {
        setRange([range[0], range[1] + daysAgo])
        setLastRangeDate(dayjs.utc().format('YYYY-MM-DD'))
      }
    },
    [length]
  )

  useEffect(
    () => {
      if (!defaultPeriod) return
      let start = defaultPeriod === -1 ? 1 : length - defaultPeriod
      if (start < 0) start = 1
      setRange([start, length], true)
    },
    [length, defaultPeriod, title]
  )

  return { range, setRange }
}
