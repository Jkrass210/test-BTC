import { useCallback, useEffect, useState } from 'react'

const API_URL =
  'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7'

function parsePrices(prices) {
  if (!prices?.length) {
    return null
  }

  const chartData = prices.map(([timestamp, price]) => ({
    date: new Date(timestamp),
    price,
  }))

  const firstPrice = prices[0][1]
  const currentPrice = prices[prices.length - 1][1]
  const changePercent = ((currentPrice - firstPrice) / firstPrice) * 100

  return { currentPrice, changePercent, chartData }
}

export function useBitcoinData(refreshInterval = 60_000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(API_URL, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Ошибка API: ${response.status}`)
        }

        const json = await response.json()
        const parsed = parsePrices(json.prices)

        if (!parsed) {
          throw new Error('Нет данных')
        }

        if (!controller.signal.aborted) {
          setData(parsed)
          setError(null)
        }
      } catch (err) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          setError(err.message || 'Не удалось загрузить данные')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    load()

    const intervalId = setInterval(load, refreshInterval)

    return () => {
      controller.abort()
      clearInterval(intervalId)
    }
  }, [refreshInterval, retryCount])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setRetryCount((count) => count + 1)
  }, [])

  return { data, loading, error, retry }
}
