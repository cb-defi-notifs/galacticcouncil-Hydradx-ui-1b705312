import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useAccountStore, useStore } from "state/store"
import { useApiPromise } from "utils/api"
import { BN_0 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { PoolAddLiquidityInformationCard } from "../../modals/AddLiquidity/AddLiquidityInfoCard"
import { useStablepoolShares } from "./AddStablepoolLiquidity.utils"
import { u8 } from "@polkadot/types"
import { u32 } from "@polkadot/types-codec"
import { BalanceByAsset } from "../../PoolsPage.utils"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { useTokenBalance } from "api/balances"
import { positive, validNumber } from "utils/validators"

type Props = {
  poolId: u32
  tradeFee: BigNumber
  asset?: { id: string; symbol: string; decimals: u32 | u8 }
  onSuccess: () => void
  onClose: () => void
  onAssetOpen: () => void
  balanceByAsset?: BalanceByAsset
}

export const AddStablepoolLiquidity = ({
  poolId,
  asset,
  onSuccess,
  onAssetOpen,
  onClose,
  balanceByAsset,
  tradeFee,
}: Props) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const form = useForm<{ amount: string }>({ mode: "onChange" })
  const displayPrice = useDisplayPrice(asset?.id)

  const amountIn = form.watch("amount")

  const { shares, assets } = useStablepoolShares({
    poolId,
    asset: { id: asset?.id, decimals: asset?.decimals, amount: amountIn },
    balanceByAsset,
  })

  const { account } = useAccountStore()
  const walletBalance = useTokenBalance(asset?.id, account?.address)

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (asset?.decimals == null) {
      throw new Error("Missing asset meta")
    }

    return await createTransaction(
      { tx: api.tx.stableswap.addLiquidity(poolId, assets) },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        onClose,
        onBack: () => {},
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: asset?.symbol,
                shares,
                fixedPointScale: asset.decimals.toString(),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onSuccess"
              tOptions={{
                value: values.amount,
                symbol: asset.symbol,
                shares,
                fixedPointScale: asset.decimals.toString(),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onError: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: asset?.symbol,
                shares,
                fixedPointScale: asset.decimals.toString(),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <ModalScrollableContent
        content={
          <div sx={{ flex: "column" }}>
            <Controller
              name="amount"
              control={form.control}
              rules={{
                required: t("wallet.assets.transfer.error.required"),
                validate: {
                  validNumber,
                  positive,
                  maxBalance: (value) => {
                    try {
                      if (asset?.decimals == null) {
                        throw new Error("Missing asset meta")
                      }

                      if (
                        walletBalance.data?.balance?.gte(
                          BigNumber(value).shiftedBy(
                            asset?.decimals.toNumber(),
                          ),
                        )
                      ) {
                        return true
                      }
                    } catch {}
                    return t("liquidity.add.modal.validation.notEnoughBalance")
                  },
                },
              }}
              render={({
                field: { name, value, onChange },
                fieldState: { error },
              }) => (
                <WalletTransferAssetSelect
                  title={t("wallet.assets.transfer.asset.label_mob")}
                  name={name}
                  value={value}
                  onChange={onChange}
                  asset={asset?.id}
                  error={error?.message}
                  onAssetOpen={onAssetOpen}
                />
              )}
            />
            <SummaryRow
              label={t("liquidity.add.modal.tradeFee")}
              content={t("value.percentage", { value: tradeFee })}
              description={t("liquidity.add.modal.tradeFee.description")}
            />
            <Spacer size={69} />
            <Text
              color="pink500"
              fs={15}
              font="FontOver"
              tTransform="uppercase"
            >
              {t("liquidity.add.modal.positionDetails")}
            </Text>
            <Summary
              rows={[
                {
                  label: t("liquidity.add.modal.shareTokens"),
                  content: t("value", {
                    value: shares,
                    type: "token",
                  }),
                },
                {
                  label: t("liquidity.remove.modal.price"),
                  content: (
                    <Text fs={14} color="white" tAlign="right">
                      <Trans
                        t={t}
                        i18nKey="liquidity.add.modal.row.spotPrice"
                        tOptions={{
                          firstAmount: 1,
                          firstCurrency: asset?.symbol,
                        }}
                      >
                        <DisplayValue value={displayPrice.data?.spotPrice} />
                      </Trans>
                    </Text>
                  ),
                },
              ]}
            />
            <PoolAddLiquidityInformationCard />
            <Spacer size={20} />
          </div>
        }
        footer={
          <div
            sx={{
              flex: "row",
              justify: "space-between",
              gap: "100px",
              mb: [24, 0],
            }}
          >
            <Button variant="secondary" type="button" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              sx={{ width: "300px" }}
              variant="primary"
              type="submit"
              disabled={!form.formState.isValid}
            >
              {t("confirm")}
            </Button>
          </div>
        }
      />
    </form>
  )
}
