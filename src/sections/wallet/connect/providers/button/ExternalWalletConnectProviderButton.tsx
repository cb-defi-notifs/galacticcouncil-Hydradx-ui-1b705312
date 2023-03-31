import { Icon } from "components/Icon/Icon"
import { SWalletButton } from "../WalletConnectProviders.styled"
import { ReactComponent as ExternalWalletIcon } from "assets/icons/ExternalWalletIcon.svg"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const ExternalWalletConnectProviderButton = ({
  onClick,
}: {
  onClick: () => void
}) => {
  const { t } = useTranslation()
  return (
    <SWalletButton sx={{ mt: 8 }} onClick={onClick}>
      <div sx={{ bg: "basic900", p: 7 }} css={{ borderRadius: "9999px" }}>
        <Icon icon={<ExternalWalletIcon />} />
      </div>
      <Text fs={18} css={{ flexGrow: 1 }}>
        {t("walletConnect.externalWallet")}
      </Text>
      <Icon sx={{ color: "brightBlue300" }} icon={<ChevronRight />} />
    </SWalletButton>
  )
}
