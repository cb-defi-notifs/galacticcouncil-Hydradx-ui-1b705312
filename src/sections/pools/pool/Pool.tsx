import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { SContainer, SGridContainer, SPositions } from "./Pool.styled"
import { PoolDetails } from "./details/PoolDetails"
import { PoolValue } from "./details/PoolValue"
import { useState } from "react"
import { PoolActions } from "./actions/PoolActions"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { PoolFooter } from "./footer/PoolFooter"
import { LiquidityPosition } from "sections/pools/pool/positions/LiquidityPosition"
import { PoolIncentives } from "./details/PoolIncentives"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

type Props = { pool: OmnipoolPool }

export const Pool = ({ pool }: Props) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const positions = usePoolPositions(pool)

  return (
    <SContainer id={pool.id.toString()}>
      <SGridContainer>
        <PoolDetails pool={pool} />
        <PoolIncentives />
        <PoolValue pool={pool} />
        <PoolActions
          pool={pool}
          canExpand={!positions.isLoading && !!positions.data?.length}
          isExpanded={isExpanded}
          onExpandClick={() => setIsExpanded((prev) => !prev)}
        />
      </SGridContainer>
      {isDesktop && positions.data?.length && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
            >
              <SPositions>
                <Text fs={[16, 16]} color="basic400" sx={{ mb: 20 }}>
                  {t("pools.pool.nft.title")}
                </Text>
                <div sx={{ flex: "column", gap: 16 }}>
                  {positions.data.map((position, i) => (
                    <LiquidityPosition
                      key={position.id}
                      position={position}
                      index={i + 1}
                    />
                  ))}
                </div>
              </SPositions>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {isDesktop && <PoolFooter />}
    </SContainer>
  )
}
