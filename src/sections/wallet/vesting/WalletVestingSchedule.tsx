import { SSchedule, SInner, SClaimButton } from "./WalletVestingSchedule.styled"
import { useCallback, useMemo } from "react"
import { Text } from "../../../components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { getFormatSeparators } from "../../../utils/formatting"
import i18n from "i18next"
import { css } from "@emotion/react"
import { theme } from "../../../theme"
import { Heading } from "../../../components/Typography/Heading/Heading"
import {
  useNextClaimableDate,
  useVestingTotalClaimableBalance,
} from "../../../api/vesting"
import { useUsdPeggedAsset } from "../../../api/asset"
import { useSpotPrice } from "../../../api/spotPrice"
import { NATIVE_ASSET_ID, useApiPromise } from "../../../utils/api"
import { useExistentialDeposit, useTokenBalance } from "../../../api/balances"
import { useAccountStore, useStore } from "../../../state/store"
import { usePaymentInfo } from "../../../api/transaction"

export const WalletVestingSchedule = () => {
  const { t } = useTranslation()
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { account } = useAccountStore()
  const separators = getFormatSeparators(i18n.languages[0])
  const { data: claimableBalance } = useVestingTotalClaimableBalance()

  const { data: nextClaimableDate } = useNextClaimableDate()
  const { data: paymentInfoData } = usePaymentInfo(api.tx.vesting.claim())
  const { data: existentialDeposit } = useExistentialDeposit()

  const usd = useUsdPeggedAsset()
  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, usd.data?.id)
  const balance = useTokenBalance(NATIVE_ASSET_ID, account?.address)

  const claimableUSD = useMemo(() => {
    if (claimableBalance && spotPrice.data) {
      return claimableBalance.times(spotPrice.data.spotPrice)
    }
    return null
  }, [claimableBalance, spotPrice])

  const [num, denom] = t("value", {
    value: claimableBalance,
    fixedPointScale: 12,
    decimalPlaces: 2,
  }).split(separators.decimal ?? ".")

  const isClaimAllowed = useMemo(() => {
    if (paymentInfoData && existentialDeposit && claimableBalance) {
      return claimableBalance.isGreaterThan(
        existentialDeposit.plus(paymentInfoData.partialFee.toBigNumber()),
      )
    }

    return false
  }, [paymentInfoData, existentialDeposit, claimableBalance])

  const handleClaim = useCallback(async () => {
    return await createTransaction({
      tx: api.tx.vesting.claim(),
    })
  }, [api, createTransaction])

  return (
    <SSchedule>
      <SInner>
        <div
          sx={{
            flex: "column",
            gap: 6,
          }}
        >
          <Text color="brightBlue200" fs={[14, 16]} fw={500}>
            {t("wallet.vesting.claimable_now")}
          </Text>
          <Heading as="h3" font="FontOver" sx={{ fontSize: [28, 34] }}>
            <Trans
              t={t}
              i18nKey="wallet.vesting.claimable_now_value"
              tOptions={{ num, denom }}
            >
              <span
                sx={{ fontSize: [14, 21] }}
                css={css`
                  color: rgba(${theme.rgbColors.white}, 0.4);
                `}
              />
            </Trans>
          </Heading>
          <Text
            fs={[14, 16]}
            lh={18}
            css={{ color: `rgba(${theme.rgbColors.white}, 0.4);` }}
          >
            {t("value.usd", { amount: claimableUSD })}
          </Text>
        </div>
        <div
          sx={{
            textAlign: "center",
            mt: [24, 0],
            width: ["100%", "auto"],
          }}
        >
          {balance.data && claimableBalance && (
            <SClaimButton
              variant="gradient"
              transform="uppercase"
              onClick={handleClaim}
              disabled={!isClaimAllowed}
            >
              {t("wallet.vesting.claim_assets")}
            </SClaimButton>
          )}
          {nextClaimableDate && (
            <Text
              color="basic300"
              tAlign="center"
              sx={{
                mt: 15,
                display: ["none", "inherit"],
              }}
            >
              {t("wallet.vesting.estimated_claim_date", {
                date: nextClaimableDate,
              })}
            </Text>
          )}
        </div>
      </SInner>
    </SSchedule>
  )
}
