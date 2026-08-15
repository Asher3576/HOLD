/**
 * 간단 선(에어리어) 차트 — TradingView lightweight-charts 래퍼.
 * HOLD 규칙: 시세만 보여준다. 수익률 %·평가금액 없음.
 * 손절선/익절선은 createPriceLine 수평선으로 표시.
 */
import { useEffect, useRef } from 'react'
import {
  AreaSeries,
  ColorType,
  LineStyle,
  createChart,
  type IChartApi,
} from 'lightweight-charts'
import type { PricePoint } from '../mock/prices'

export interface PlanLine {
  price: number
  color: string
  title: string
  dashed?: boolean
}

export default function PriceChart({
  data,
  lines = [],
  height = 150,
}: {
  data: PricePoint[]
  lines?: PlanLine[]
  height?: number
}) {
  const elRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const chart = createChart(el, {
      height,
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#7A8296',
        fontSize: 10,
        attributionLogo: false,
      },
      // 브라우저 로케일이 비표준 태그일 때 Intl이 던지는 것 방어 + 한국어 날짜 표기
      localization: { locale: 'ko-KR' },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)' },
      crosshair: {
        horzLine: { labelBackgroundColor: '#1D2432' },
        vertLine: { labelBackgroundColor: '#1D2432' },
      },
      // 미니 차트 — 스크롤/줌 없이 정적으로
      handleScroll: false,
      handleScale: false,
    })
    chartRef.current = chart

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#57C7A4',
      lineWidth: 2,
      topColor: 'rgba(87,199,164,0.25)',
      bottomColor: 'rgba(87,199,164,0.0)',
      priceLineVisible: false,
      lastValueVisible: true,
      priceFormat: { type: 'price', precision: 0, minMove: 1 },
      // 계획선(손절/익절)이 항상 프레임 안에 — 차트의 프레임 = 계획 구간
      autoscaleInfoProvider: (original: () => { priceRange: { minValue: number; maxValue: number } } | null) => {
        const res = original()
        if (!res || lines.length === 0) return res
        const prices = lines.map((l) => l.price)
        return {
          ...res,
          priceRange: {
            minValue: Math.min(res.priceRange.minValue, ...prices),
            maxValue: Math.max(res.priceRange.maxValue, ...prices),
          },
        }
      },
    })
    series.setData(data)

    for (const l of lines) {
      series.createPriceLine({
        price: l.price,
        color: l.color,
        lineWidth: 1,
        lineStyle: l.dashed === false ? LineStyle.Solid : LineStyle.Dashed,
        axisLabelVisible: true,
        title: l.title,
      })
    }

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
      chartRef.current = null
    }
    // 데이터/라인이 바뀌면 차트를 새로 그린다 (미니 차트라 충분)
  }, [data, lines, height])

  return <div ref={elRef} style={{ width: '100%', height }} />
}
