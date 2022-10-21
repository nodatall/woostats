import { useEffect, useState } from 'react'

import dayjs from 'lib/dayjs'
import { useLocalStorage } from 'lib/storageHooks'

let rangeSetTimeout
let rangeSliderDebounce = null

export default function useDateRangeSliderHook({ length, title, defaultPeriod }) {
  const defaultRange = [1, length]
  const [range = defaultRange, _setRange] = (
    defaultPeriod ? useState(defaultRange) : useLocalStorage(`${title}RangeSlider`)
  )
  const [
    lastRangeDate = dayjs.tz().format('YYYY-MM-DD'), setLastRangeDate
  ] = useLocalStorage(`${title}RangeSliderLastDate`)

  const setRange = (val, ignoreDebounce) => {
    if (rangeSliderDebounce && !ignoreDebounce) return
    rangeSliderDebounce = true
    _setRange(val)
    clearTimeout(rangeSetTimeout)
    rangeSetTimeout = setTimeout(() => {
      setLastRangeDate(dayjs.tz().format('YYYY-MM-DD'))
    }, 500)
    setTimeout(() => {
      rangeSliderDebounce = null
    }, 20)
  }

  useEffect(
    () => {
      const today = dayjs.tz(dayjs.tz().format('YYYY-MM-DD'))
      const daysAgo = today.diff(lastRangeDate, 'day')
      if (daysAgo > 0 && length - range[1] === daysAgo) {
        setRange([range[0], range[1] + daysAgo])
        setLastRangeDate(dayjs.tz().format('YYYY-MM-DD'))
      }
    },
    []
  )

  useEffect(
    () => {
      if (!defaultPeriod) return
      const start = defaultPeriod === -1 ? 1 : length - defaultPeriod
      setRange([start, length], true)
    },
    [defaultPeriod]
  )

  return { range, setRange }
}
