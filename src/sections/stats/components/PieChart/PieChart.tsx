import { ComponentProps } from "react"
import { ASSET_COLORS } from "./PieChart.utils"
import {
  SliceLabelRest,
  TLabelRest,
} from "./components/SliceLabelRest/SliceLabelRest"
import { SliceLabel } from "./components/SliceLabel/SliceLabel"
import { PieSkeleton } from "./components/Skeleton/Skeleton"
import { t } from "i18next"
import { BN_0 } from "utils/constants"
import { DoughnutChart } from "sections/stats/components/DoughnutChart/DoughnutChart"
import { EmotionJSX } from "@emotion/react/types/jsx-namespace"
import BN from "bignumber.js"

type TSlice = {
  percentage: number
  color: string
  label: EmotionJSX.Element
  symbol: string
  name: string
  assets?: TLabelRest[]
}

type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P
} &
  keyof T

type DataEntry = {
  id: string
  name: string
  symbol: string
  [key: string]: BN | string
}

type PieChartProps<T extends DataEntry> = {
  data: Array<T>
  property: Extract<KeyOfType<T, BN>, string>
  label?: ComponentProps<typeof DoughnutChart>["label"]
}

export const PieChart = <T extends DataEntry>({
  data,
  label,
  property,
}: PieChartProps<T>) => {
  const getValue = (dataEntry: T): BN => {
    const propValue = dataEntry[property]
    return BN.isBigNumber(propValue) ? propValue : BN_0
  }

  const total = data?.reduce(
    (acc, omnipoolAsset) => getValue(omnipoolAsset).plus(acc),
    BN_0,
  )

  if (!data || total.isNaN() || total.isZero()) {
    return <PieSkeleton />
  }

  const slices = data
    ?.reduce<TSlice[]>((acc, omnipoolAsset) => {
      const percentage = Number(
        getValue(omnipoolAsset).div(total).multipliedBy(100).toFixed(2),
      )

      if (percentage > 1) {
        const label = (
          <SliceLabel
            key={percentage}
            symbol={omnipoolAsset.symbol}
            value={getValue(omnipoolAsset)}
            percentage={percentage}
          />
        )

        acc.push({
          percentage,
          color: ASSET_COLORS[omnipoolAsset.symbol.toLowerCase()] ?? "#ffffff",
          label,
          symbol: omnipoolAsset.symbol,
          name: omnipoolAsset.name,
        })
      } else {
        const restAssets = acc.find((slice) => slice.symbol === "rest")

        if (restAssets) {
          const assets = [
            ...(restAssets.assets ?? []),
            {
              name: omnipoolAsset.name,
              percentage,
              value: getValue(omnipoolAsset),
            },
          ]

          const label = (
            <SliceLabelRest
              key={percentage}
              assets={assets}
              property={property}
            />
          )

          return acc.map((slice) =>
            slice.symbol === "rest"
              ? {
                  ...slice,
                  percentage: (slice.percentage += percentage),
                  label,
                  assets,
                }
              : slice,
          )
        } else {
          const assets = [
            {
              name: omnipoolAsset.name,
              percentage,
              value: getValue(omnipoolAsset),
            },
          ]
          const label = (
            <SliceLabelRest
              key={percentage}
              assets={assets}
              property={property}
            />
          )

          acc.push({
            percentage,
            color: "#D9D9D9",
            label,
            symbol: "rest",
            assets,
            name: t("stats.overview.pie.rest.header.assets"),
          })
        }
      }

      return acc
    }, [])
    .sort((a) => (a.symbol !== "rest" ? -1 : 0))

  return <DoughnutChart slices={slices} label={label} />
}
