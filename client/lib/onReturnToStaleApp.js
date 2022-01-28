export default function onReturnToStaleApp(handler, seconds) {
  let lastBlurredAt

  window.addEventListener('focus', () => {
    if (!lastBlurredAt) return
    const now = Date.now()
    const minutesSinceBlur = ((now - lastBlurredAt) / 1000)
    if (minutesSinceBlur < seconds) return
    handler()
  })

  window.addEventListener('blur', function() {
    lastBlurredAt = Date.now()
  })
}
