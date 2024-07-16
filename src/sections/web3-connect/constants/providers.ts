import { WalletProviderType } from "sections/web3-connect/wallets"

export const MOBILE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.Talisman,
  WalletProviderType.TalismanEvm,
  WalletProviderType.SubwalletJS,
  WalletProviderType.SubwalletEvm,
  WalletProviderType.TrustWallet,
  WalletProviderType.Phantom,
  WalletProviderType.Enkrypt,
  WalletProviderType.NovaWallet,
  // WalletProviderType.MantaWallet,
  // WalletProviderType.FearlessWallet,
  // WalletProviderType.Polkagate,
  // WalletProviderType.AlephZero,
  WalletProviderType.WalletConnect,
]

export const DESKTOP_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.Talisman,
  WalletProviderType.TalismanEvm,
  WalletProviderType.SubwalletJS,
  WalletProviderType.SubwalletEvm,
  WalletProviderType.TrustWallet,
  WalletProviderType.Phantom,
  WalletProviderType.Enkrypt,
  WalletProviderType.PolkadotJS,
  // WalletProviderType.MantaWallet,
  // WalletProviderType.FearlessWallet,
  // WalletProviderType.Polkagate,
  // WalletProviderType.AlephZero,
  WalletProviderType.WalletConnect,
]

export const EVM_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.MetaMask,
  WalletProviderType.TalismanEvm,
  WalletProviderType.SubwalletEvm,
  WalletProviderType.TrustWallet,
  WalletProviderType.Phantom,
  WalletProviderType.WalletConnect,
]

export const SUBSTRATE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.Talisman,
  WalletProviderType.SubwalletJS,
  WalletProviderType.Enkrypt,
  WalletProviderType.PolkadotJS,
  WalletProviderType.NovaWallet,
  // WalletProviderType.MantaWallet,
  // WalletProviderType.FearlessWallet,
  // WalletProviderType.Polkagate,
  // WalletProviderType.AlephZero,
  WalletProviderType.WalletConnect,
]

export const ALTERNATIVE_PROVIDERS: WalletProviderType[] = [
  WalletProviderType.ExternalWallet,
]
