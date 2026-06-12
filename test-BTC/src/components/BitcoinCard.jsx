import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useBitcoinData } from '../hooks/useBitcoinData'
import './BitcoinCard.css'

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
})

function formatChangePercent(value) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function BtcIcon() {
  return (
    <svg
      className="bitcoin-card__icon"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        fill="#FFF"
        d="M22.5 14.1c.3-2-1.2-3-3.3-3.7l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.7-.2-1.1-.2v-.1l-2.2-.6-.5 1.8s1.2.3 1.2.3c.7.2.8.7.8 1.1l-.8 3.2c0 0 .2 0 .3.1h-.3l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.9 2.1 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.6.4.7-2.7c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.4c-.5 2.1-4.1 1-5.3.7l.9-3.7c1.2.3 5 .9 4.4 3zm.5-5.5c-.5 1.9-3.5.9-4.5.7l.9-3.4c1 .3 4.2.8 3.6 2.7z"
      />
    </svg>
  )
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const { date, price } = payload[0].payload

  return (
    <div className="bitcoin-card__tooltip">
      <div>{dateFormatter.format(date)}</div>
      <div>{priceFormatter.format(price)}</div>
    </div>
  )
}

export default function BitcoinCard() {
  const { data, loading, error, retry } = useBitcoinData()

  if (loading && !data) {
    return (
      <div className="bitcoin-card">
        <div className="bitcoin-card__loading">
          <div className="bitcoin-card__spinner" />
          <span>Загрузка данных...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bitcoin-card">
        <div className="bitcoin-card__error">
          <span>{error}</span>
          <button type="button" className="bitcoin-card__retry" onClick={retry}>
            Повторить
          </button>
        </div>
      </div>
    )
  }

  const { currentPrice, changePercent, chartData } = data
  const isUp = changePercent >= 0

  return (
    <div className="bitcoin-card">
      <div className="bitcoin-card__header">
        <h1 className="bitcoin-card__title">
          <BtcIcon />
          Bitcoin (BTC)
        </h1>
        <p className="bitcoin-card__price">{priceFormatter.format(currentPrice)}</p>
        <span
          className={`bitcoin-card__change bitcoin-card__change--${isUp ? 'up' : 'down'}`}
        >
          {formatChangePercent(changePercent)} за 7 дней
        </span>
      </div>

      <div className="bitcoin-card__chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tickFormatter={(date) => dateFormatter.format(date)}
              stroke="var(--text)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) =>
                `$${(value / 1000).toFixed(0)}k`
              }
              stroke="var(--text)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--accent)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
