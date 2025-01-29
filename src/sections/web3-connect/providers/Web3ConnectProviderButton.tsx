import ChevronRight from "assets/icons/ChevronRight.svg?react"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import LogoutIcon from "assets/icons/LogoutIcon.svg?react"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC, useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  WalletProvider,
  WalletProviderType,
  useEnableWallet,
  useWalletAccounts,
} from "sections/web3-connect/Web3Connect.utils"
import {
  SAccountIndicator,
  SConnectionIndicator,
  SProviderButton,
} from "./Web3ConnectProviders.styled"
import {
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { Web3ConnectProviderIcon } from "sections/web3-connect/providers/Web3ConnectProviderIcon"
import { isMobileDevice, openUrl } from "utils/helpers"
import { Button } from "@galacticcouncil/ui"

type Props = WalletProvider & {
  children?: (props: {
    onClick: () => void
    isConnected: boolean
  }) => JSX.Element
}

export const Web3ConnectProviderButton: FC<Props> = ({
  type,
  wallet,
  children,
}) => {
  const { t } = useTranslation()

  const { setStatus, setError, disconnect, getStatus } = useWeb3ConnectStore()

  const { title, installed, installUrl } = wallet

  const { enable } = useEnableWallet(type, {
    onMutate: () => setStatus(type, WalletProviderStatus.Pending),
    onSuccess: () => setStatus(type, WalletProviderStatus.Connected),
    onError: (error) => {
      if (
        type !== WalletProviderType.WalletConnect &&
        type !== WalletProviderType.WalletConnectEvm
      ) {
        setStatus(type, WalletProviderStatus.Error)
      }

      if (error instanceof Error && error.message) {
        setError(error.message)
      }
    },
  })

  const { data: accounts } = useWalletAccounts(type)
  const accountsCount = accounts?.length || 0

  const isConnected = getStatus(type) === WalletProviderStatus.Connected

  const isOpenableInMobileApp =
    !wallet.installed && !!wallet?.appLink && isMobileDevice()

  const onClick = useCallback(() => {
    if (isConnected) {
      return disconnect(type)
    }

    if (isOpenableInMobileApp && wallet?.appLink) {
      return openUrl(wallet.appLink, "_self")
    }

    if (type === WalletProviderType.WalletConnect) {
      enable("polkadot")
    } else if (type === WalletProviderType.WalletConnectEvm) {
      enable("eip155")
    } else {
      installed ? enable() : openUrl(installUrl)
    }
  }, [
    disconnect,
    enable,
    installUrl,
    installed,
    isConnected,
    isOpenableInMobileApp,
    type,
    wallet.appLink,
  ])

  if (typeof children === "function") {
    return children({ onClick, isConnected })
  }

  if (isOpenableInMobileApp && type === WalletProviderType.Phantom) {
    return (
      <SProviderButton as="div">
        <Web3ConnectProviderIcon type={type} />
        <Text fs={[12, 13]} sx={{ mt: 8, mb: 10 }} tAlign="center">
          {title}
        </Text>
        {wallet.deepLink && (
          <a
            sx={{
              p: 10,
              bg: "basic400",
              mb: 20,
              width: "100%",
              textAlign: "center",
            }}
            href={wallet.deepLink}
          >
            Deeplink
          </a>
        )}
        {wallet.appLink && (
          <a
            sx={{ p: 10, bg: "basic400", width: "100%", textAlign: "center" }}
            href={wallet.appLink}
          >
            Universal link
          </a>
        )}
      </SProviderButton>
    )
  }

  return (
    <SProviderButton onClick={onClick}>
      <Web3ConnectProviderIcon type={type} />
      <Text fs={[12, 13]} sx={{ mt: 8 }} tAlign="center">
        {title}
      </Text>
      <Text
        color={isConnected ? "basic500" : "brightBlue300"}
        fs={[12, 13]}
        sx={{ flex: "row", align: "center" }}
      >
        {isConnected ? (
          <>
            {t("walletConnect.provider.disconnect")}
            <LogoutIcon width={18} height={18} />
          </>
        ) : installed ? (
          <>
            {t("walletConnect.provider.continue")}
            <ChevronRight width={18} height={18} />
          </>
        ) : isOpenableInMobileApp ? (
          <>
            {t("walletConnect.provider.open")}
            <LinkIcon sx={{ ml: 4 }} width={10} height={10} />
          </>
        ) : (
          <>
            {t("walletConnect.provider.download")}
            <DownloadIcon width={18} height={18} />
          </>
        )}
      </Text>
      {isConnected && <SConnectionIndicator />}
      {isConnected && accountsCount > 0 && (
        <SAccountIndicator>+{accountsCount}</SAccountIndicator>
      )}
    </SProviderButton>
  )
}
