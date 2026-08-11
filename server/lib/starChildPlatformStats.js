const STAR_CHILD_PLATFORM_STATS_URL = 'https://ai-api.iamstarchild.com/api/cloud/platform-stats'
const STAR_CHILD_PLATFORM_STAT_FIELDS = {
  agents_launched: 'agentsLaunched',
  human_queries: 'humanQueries',
  skills_available: 'skillsAvailable',
  tokens_used_30d: 'tokensUsed30d',
}

function normalizePlatformStats(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Star Child platform stats response must be an object')
  }

  const expectedFields = Object.keys(STAR_CHILD_PLATFORM_STAT_FIELDS)
  if (expectedFields.some(field => !Object.prototype.hasOwnProperty.call(data, field))) {
    throw new Error(`Star Child platform stats response must contain all required fields: ${expectedFields.join(', ')}`)
  }

  return expectedFields.reduce((normalized, field) => {
    const value = data[field]
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
      throw new Error(`Star Child platform stat "${field}" must be a finite non-negative integer`)
    }
    normalized[STAR_CHILD_PLATFORM_STAT_FIELDS[field]] = value
    return normalized
  }, {})
}

async function fetchStarChildPlatformStats({
  fetchImpl = globalThis.fetch,
  timeoutMs = 5000,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let response
    try {
      response = await fetchImpl(STAR_CHILD_PLATFORM_STATS_URL, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(`Star Child platform stats request timed out after ${timeoutMs}ms`, { cause: error })
      }
      throw error
    }

    if (!response || !response.ok) {
      const status = response && response.status ? ` with status ${response.status}` : ''
      throw new Error(`Star Child platform stats request failed${status}`)
    }

    return normalizePlatformStats(await response.json())
  } finally {
    clearTimeout(timeout)
  }
}

module.exports = {
  STAR_CHILD_PLATFORM_STATS_URL,
  fetchStarChildPlatformStats,
  normalizePlatformStats,
}
