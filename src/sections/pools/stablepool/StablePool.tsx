import { SContainer, SGridContainer } from "sections/pools/pool/Pool.styled"
import { PoolDetails } from "./details/PoolDetails"
import { PoolValue } from "./details/PoolValue"
import { PoolActions } from "./actions/PoolActions"
import { PoolIncentives } from "./details/PoolIncentives"
import { useOmnipoolStablePools } from "../PoolsPage.utils"
import { useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { LiquidityPositionWrapper } from "./positions/LiquidityPositionWrapper"

type Props = Exclude<
  ReturnType<typeof useOmnipoolStablePools>["data"],
  undefined
>[number]

const STABLEPOOL_INCENTIVES_ENABLED = false

export const StablePool = ({
  id,
  tradeFee,
  assets,
  total,
  balanceByAsset,
  assetMetaById,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <SContainer id={id.toString()}>
      <SGridContainer>
        <PoolDetails
          assets={assets}
          tradeFee={tradeFee}
          css={{ gridArea: "details" }}
        />
        {STABLEPOOL_INCENTIVES_ENABLED ? (
          <PoolIncentives poolId={id} css={{ gridArea: "incentives" }} />
        ) : (
          <div css={{ gridArea: "incentives" }} />
        )}
        <PoolValue total={total.value} css={{ gridArea: "values" }} />
        <PoolActions
          poolId={id}
          tradeFee={tradeFee}
          css={{ gridArea: "actions" }}
          balanceByAsset={balanceByAsset}
          assetMetaById={assetMetaById}
        />
      </SGridContainer>
      {isDesktop && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
            >
              <LiquidityPositionWrapper />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </SContainer>
  )
}
