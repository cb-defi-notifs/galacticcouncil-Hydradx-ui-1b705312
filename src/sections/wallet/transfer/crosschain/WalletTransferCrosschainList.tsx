import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { WalletTransferCrosschainListItem } from "./WalletTransferCrosschainListItem"
import { SList } from "./WalletTransferSectionCrosschain.styled"
import { CROSSCHAINS } from "./WalletTransferSectionCrosschain.utils"

export function WalletTransferCrosschainList(props: {
  onSelect: (name: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation()

  return (
    <div
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <div sx={{ flex: "column" }}>
        <Text fs={18} lh={25} sx={{ maxWidth: 360 }}>
          {t("wallet.assets.transfer.bridge.description")}
        </Text>

        <Spacer size={30} />

        <SList>
          {CROSSCHAINS.map((chain) => (
            <WalletTransferCrosschainListItem
              {...chain}
              key={chain.name}
              onClick={() => props.onSelect(chain.name)}
            />
          ))}
        </SList>
      </div>

      <div sx={{ flex: "column", align: "center" }}>
        <Spacer size={30} />

        <Button variant="secondary" onClick={props.onClose}>
          {t("wallet.assets.transfer.cancel")}
        </Button>
      </div>
    </div>
  )
}
