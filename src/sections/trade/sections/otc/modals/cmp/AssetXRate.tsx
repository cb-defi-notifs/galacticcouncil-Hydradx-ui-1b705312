import * as React from "react"
import * as UI from "@galacticcouncil/ui"
import { createComponent, EventName } from "@lit-labs/react"
import { useTranslation } from "react-i18next"
import { useSpotPrice } from "api/spotPrice"
import { useRpcProvider } from "providers/rpcProvider"

export const UigcAssetXRate = createComponent({
  tagName: "uigc-asset-x-rate",
  elementClass: UI.AssetXRate,
  react: React,
  events: {
    onAssetInputChanged: "asset-input-changed" as EventName<CustomEvent>,
  },
})

export const UigcButton = createComponent({
  tagName: "uigc-button",
  elementClass: UI.Button,
  react: React,
})

export function OrderAssetRate(props: {
  inputAsset: string | undefined
  outputAsset: string | undefined
  price: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const inputMeta = props.inputAsset
    ? assets.getAsset(props.inputAsset)
    : undefined
  const outputMeta = props.outputAsset
    ? assets.getAsset(props.outputAsset)
    : undefined

  const sp = useSpotPrice(props.inputAsset, props.outputAsset)
  const spotPrice = sp.data?.spotPrice

  return (
    <UigcAssetXRate
      onAssetInputChanged={(e) => props.onChange(e.detail.value)}
      title={t("otc.order.place.price", { symbol: inputMeta?.symbol })}
      asset={outputMeta?.symbol}
      amount={props.price}
      unit={outputMeta?.symbol}
    >
      {!spotPrice?.isNaN() && (
        <UigcButton
          slot="button"
          onClick={() =>
            spotPrice ? props.onChange(spotPrice.toFixed()) : "0"
          }
          {...{ variant: "max", size: "micro", nowrap: true }}
        >
          Last omnipool price
        </UigcButton>
      )}
    </UigcAssetXRate>
  )
}
