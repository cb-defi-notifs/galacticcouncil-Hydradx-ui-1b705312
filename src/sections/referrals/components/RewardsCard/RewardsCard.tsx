import Treasury from "assets/icons/Treasury.svg?react"
import { Button } from "components/Button/Button"
import { Card } from "components/Card/Card"
import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAccountRewards, useClaimsMutation } from "./Rewards.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import Skeleton from "react-loading-skeleton"
import { useRpcProvider } from "providers/rpcProvider"
import { useReferrerTierData } from "sections/referrals/ReferralsPage.utils"

export const RewardsCard = () => {
  const { assets } = useRpcProvider()
  const { t } = useTranslation()
  const { account } = useAccount()
  const rewards = useAccountRewards(account?.address)
  const { isLevelUp } = useReferrerTierData(account?.address)

  const { mutate, isLoading } = useClaimsMutation()

  return (
    <Card
      title={t("referrals.rewards.title")}
      variant={isLevelUp ? "green" : "primary"}
      icon={<Treasury width={16} height={16} />}
      css={{ flexGrow: 2 }}
    >
      <div
        sx={{
          flex: ["column"],
          flexWrap: ["wrap", "nowrap"],
          gap: 20,
          justify: "space-between",
          align: "center",
          width: "100%",
        }}
      >
        <FeatureBox
          label={t("referrals.rewards.desc")}
          title={
            rewards.isLoading ? (
              <Skeleton height={19} width={60} />
            ) : (
              <Text font="FontOver" fs={19}>
                {t("value.tokenWithSymbol", {
                  value: rewards.data,
                  symbol: assets.native.symbol,
                })}
              </Text>
            )
          }
        />
        <Button
          css={{ whiteSpace: "nowrap", height: "min-content" }}
          fullWidth
          size="small"
          variant={isLevelUp ? "green" : "primary"}
          isLoading={isLoading}
          disabled={
            !rewards.data ||
            rewards.data.isZero() ||
            account?.isExternalWalletConnected
          }
          onClick={() => mutate({ value: rewards.data })}
        >
          {t(
            isLevelUp
              ? "referrals.rewards.claim.levelup"
              : "referrals.rewards.claim",
          )}
        </Button>
      </div>
    </Card>
  )
}
