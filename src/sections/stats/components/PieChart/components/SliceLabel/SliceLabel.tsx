import BigNumber from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

type SliceLabelProps = {
  symbol: string
  percentage: number
  tvl: BigNumber
}

export const SliceLabel = ({ symbol, percentage, tvl }: SliceLabelProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      sx={{ flex: "column", align: "center", gap: 6 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon size={[20, 36]} icon={getAssetLogo(symbol)} />
      <Text color="basic100" fs={[20, 34]}>
        {t("value.percentage", { value: percentage })}
      </Text>
      <Text color="basic100" fs={[10, 20]}>
        <DisplayValue value={tvl} isUSD />
      </Text>
      <Text color="basic100" fs={[10, 20]}>
        {symbol}
      </Text>
    </motion.div>
  )
}
