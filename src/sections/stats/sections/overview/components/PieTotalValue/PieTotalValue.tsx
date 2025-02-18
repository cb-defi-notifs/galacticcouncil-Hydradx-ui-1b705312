import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"

type PieTotalValueProps = {
  title: string
  data: BN
  isLoading: boolean
}

export const PieTotalValue = ({
  title,
  data,
  isLoading,
}: PieTotalValueProps) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  if (isLoading) return <Skeleton width={200} height={isDesktop ? 42 : 20} />

  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <Text color="brightBlue300">{title}</Text>
      <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
        <Text fs={[20, 42]} font="FontOver">
          <DisplayValue value={data} isUSD />
        </Text>
      </div>
    </div>
  )
}
