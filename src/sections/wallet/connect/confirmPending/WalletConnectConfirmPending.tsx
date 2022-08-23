import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Box } from "components/Box/Box"
import { Spinner } from "components/Spinner/Spinner.styled"
import { ReactComponent as PolkadotLogo } from "assets/icons/PolkadotLogo.svg"
import { ReactComponent as TalismanLogo } from "assets/icons/TalismanLogo.svg"
import { ProviderType } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { useTranslation } from "react-i18next"
import { FC, ReactNode } from "react"

type Props = { provider: ProviderType }

export const WalletConnectConfirmPending: FC<Props> = ({ provider }) => {
  const { t } = useTranslation("translation")

  let name: string | null = null
  let logo: ReactNode | null = null
  if (provider === "polkadot-js") {
    name = "Polkadot"
    logo = <PolkadotLogo width={48} height={48} />
  } else if (provider === "talisman") {
    name = "Talisman"
    logo = <TalismanLogo width={48} height={48} />
  }

  return (
    <Box flex align="center" column>
      <Box
        css={css`
          display: grid;
          grid-template-columns: 1fr;

          align-items: center;
          justify-items: center;

          > * {
            grid-column: 1;
            grid-row: 1;
          }
        `}
      >
        <Spinner css={{ width: 80, height: 80 }} />
        {logo}
      </Box>
      <GradientText mt={20} fs={24} fw={600} tAlign="center">
        {t("walletConnect.pending.title")}
      </GradientText>
      <Box pl={20} pr={20} mt={20} mb={40}>
        <Text tAlign="center" fs={16} color="neutralGray200" fw={400} lh={22}>
          {t("walletConnect.pending.description", { name })}
        </Text>
      </Box>
    </Box>
  )
}
