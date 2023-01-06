import { useTradeAssets } from "api/asset"
import { useMemo } from "react"
import BN from "bignumber.js"
import { useAssetMetaList } from "api/assetMeta"
import { useAccountStore } from "state/store"
import { useAccountBalances } from "api/accountBalances"
import { useSpotPrices } from "api/spotPrice"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_10 } from "utils/constants"
import { AssetsTableData } from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { PalletBalancesAccountData } from "@polkadot/types/lookup"
import { u32 } from "@polkadot/types"
import { useAssetDetailsList } from "api/assetDetails"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { useTokensLocks } from "api/balances"
import { useAcceptedCurrencies, useAccountCurrency } from "api/payments"
import { useApiIds } from "api/consts"

export const useAssetsTableData = () => {
  const { account } = useAccountStore()
  const tradeAssets = useTradeAssets()
  const accountBalances = useAccountBalances(account?.address)
  const balances = useAssetsBalances()
  const acceptedCurrenciesQuery = useAcceptedCurrencies([
    NATIVE_ASSET_ID,
    ...(accountBalances.data?.balances ?? []).map((b) => b.id),
  ])
  const accountCurrency = useAccountCurrency(account?.address)
  const assetDetails = useAssetDetailsList()
  const assetMetadata = useAssetMetaList(
    assetDetails.data?.map((ad) => ad.id.toString()) ?? [],
  )

  const queries = [
    assetDetails,
    balances,
    accountCurrency,
    assetMetadata,
    ...acceptedCurrenciesQuery,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      isLoading ||
      !assetDetails.data ||
      !assetMetadata.data ||
      !balances.data ||
      !tradeAssets.data ||
      acceptedCurrenciesQuery.some((q) => !q.data)
    )
      return []

    const acceptedCurrencies = [
      {
        id: NATIVE_ASSET_ID,
        accepted: true,
      },
      ...acceptedCurrenciesQuery.reduce(
        (acc, curr) => (curr.data?.accepted ? [...acc, curr.data] : acc),
        [] as { id: string; accepted: boolean }[],
      ),
    ]

    const res = assetDetails.data.map((asset) => {
      const balance = balances.data?.find(
        (b) => b.id.toString() === asset.id.toString(),
      )

      const metadata = assetMetadata.data?.find(
        (a) => a.id.toString() === asset.id.toString(),
      )

      const couldBeSetAsPaymentFee = acceptedCurrencies.some(
        (currency) =>
          currency.id === asset.id?.toString() &&
          currency.id !== accountCurrency.data,
      )

      return {
        id: asset.id?.toString(),
        symbol: metadata?.symbol ?? "N/A",
        name: asset.name || getAssetName(metadata?.symbol),
        transferable: balance?.transferable ?? BN_0,
        transferableUSD: balance?.transferableUSD ?? BN_0,
        inTradeRouter:
          tradeAssets.data.find((i) => i.id === asset.id?.toString()) != null,
        total: balance?.total ?? BN_0,
        totalUSD: balance?.totalUSD ?? BN_0,
        lockedVesting: balance?.lockedVesting ?? BN_0,
        lockedVestingUSD: balance?.lockedVestingUSD ?? BN_0,
        lockedDemocracy: balance?.lockedDemocracy ?? BN_0,
        lockedDemocracyUSD: balance?.lockedDemocracyUSD ?? BN_0,
        reserved: balance?.reserved ?? BN_0,
        reservedUSD: balance?.reservedUSD ?? BN_0,
        origin: "TODO",
        assetType: asset.assetType,
        isPaymentFee: asset.id?.toString() === accountCurrency.data,
        couldBeSetAsPaymentFee,
      }
    })

    return res
      .filter((x): x is AssetsTableData => x !== null)
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .sort((a, b) => b.transferable.minus(a.transferable).toNumber())
      .sort((a) => (a.id === NATIVE_ASSET_ID ? -1 : 1)) // native asset first
  }, [
    isLoading,
    assetDetails.data,
    balances.data,
    tradeAssets.data,
    acceptedCurrenciesQuery,
    assetMetadata.data,
    accountCurrency.data,
  ])

  return { data, isLoading }
}

export const useAssetsBalances = () => {
  const { account } = useAccountStore()
  const accountBalances = useAccountBalances(account?.address)
  const tokenIds = accountBalances.data?.balances
    ? [NATIVE_ASSET_ID, ...accountBalances.data.balances.map((b) => b.id)]
    : []
  const assetMetas = useAssetMetaList(tokenIds)
  const apiIds = useApiIds()
  const spotPrices = useSpotPrices(tokenIds, apiIds.data?.usdId)
  const locksQueries = useTokensLocks(tokenIds)

  const queries = [
    accountBalances,
    assetMetas,
    apiIds,
    ...spotPrices,
    ...locksQueries,
  ]
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !accountBalances.data ||
      !assetMetas.data ||
      spotPrices.some((q) => !q.data) ||
      locksQueries.some((q) => !q.data)
    )
      return undefined

    const locks = locksQueries.reduce(
      (acc, cur) => (cur.data ? [...acc, ...cur.data] : acc),
      [] as { id: string; amount: BN; type: string }[],
    )

    const tokens: (AssetsTableDataBalances | null)[] =
      accountBalances.data.balances.map((ab) => {
        const id = ab.id
        const spotPrice = spotPrices.find(
          (sp) => id.toString() === sp.data?.tokenIn,
        )
        const meta = assetMetas.data.find((am) => id.toString() === am?.id)

        if (!spotPrice?.data || !meta) return null

        const dp = BN_10.pow(meta.decimals.toBigNumber())
        const free = ab.data.free.toBigNumber()
        const reservedBN = ab.data.reserved.toBigNumber()
        const frozen = ab.data.frozen.toBigNumber()

        const total = free.plus(reservedBN).div(dp)
        const totalUSD = total.times(spotPrice.data.spotPrice)

        const transferable = free.minus(frozen).div(dp)
        const transferableUSD = transferable.times(spotPrice.data.spotPrice)

        const reserved = reservedBN.div(dp)
        const reservedUSD = reserved.times(spotPrice.data.spotPrice)

        const lockVesting = locks.find(
          (lock) => lock.id === id.toString() && lock.type === "ormlvest",
        )
        const lockedVesting = lockVesting?.amount.div(dp) ?? BN_0
        const lockedVestingUSD = lockedVesting.times(spotPrice.data.spotPrice)

        const lockDemocracy = locks.find(
          (lock) => lock.id === id.toString() && lock.type === "democrac",
        )
        const lockedDemocracy = lockDemocracy?.amount.div(dp) ?? BN_0
        const lockedDemocracyUSD = lockedDemocracy.times(
          spotPrice.data.spotPrice,
        )

        return {
          id,
          total,
          totalUSD,
          transferable,
          transferableUSD,
          lockedVesting,
          lockedVestingUSD,
          lockedDemocracy,
          lockedDemocracyUSD,
          reserved,
          reservedUSD,
        }
      })

    const nativeBalance = accountBalances.data.native.data
    const nativeDecimals = assetMetas.data
      .find((am) => am?.id === NATIVE_ASSET_ID)
      ?.decimals.toBigNumber()
    const nativeSpotPrice = spotPrices.find(
      (sp) => sp.data?.tokenIn === NATIVE_ASSET_ID,
    )?.data?.spotPrice

    const nativeLockVesting = locks.find(
      (lock) => lock.id === NATIVE_ASSET_ID && lock.type === "ormlvest",
    )?.amount
    const nativeLockDemocracy = locks.find(
      (lock) => lock.id === NATIVE_ASSET_ID && lock.type === "democrac",
    )?.amount

    const native = getNativeBalances(
      nativeBalance,
      nativeDecimals,
      nativeSpotPrice,
      nativeLockVesting,
      nativeLockDemocracy,
    )

    return [native, ...tokens].filter(
      (x): x is AssetsTableDataBalances => x !== null,
    )
  }, [accountBalances.data, assetMetas, spotPrices, locksQueries])

  return { data, isLoading: isInitialLoading }
}

const getNativeBalances = (
  balance: PalletBalancesAccountData,
  decimals?: BN,
  spotPrice?: BN,
  lockVesting?: BN,
  lockDemocracy?: BN,
): AssetsTableDataBalances | null => {
  if (!decimals || !spotPrice) return null

  const dp = BN_10.pow(decimals)
  const free = balance.free.toBigNumber()
  const reservedBN = balance.reserved.toBigNumber()
  const feeFrozen = balance.feeFrozen.toBigNumber()
  const miscFrozen = balance.miscFrozen.toBigNumber()

  const total = free.plus(reservedBN).div(dp)
  const totalUSD = total.times(spotPrice)

  const transferable = free.minus(BN.max(feeFrozen, miscFrozen)).div(dp)
  const transferableUSD = transferable.times(spotPrice)

  const reserved = reservedBN.div(dp)
  const reservedUSD = reserved.times(spotPrice)

  const lockedVesting = lockVesting?.div(dp) ?? BN_0
  const lockedVestingUSD = lockedVesting.times(spotPrice)

  const lockedDemocracy = lockDemocracy?.div(dp) ?? BN_0
  const lockedDemocracyUSD = lockedDemocracy.times(spotPrice)

  return {
    id: NATIVE_ASSET_ID,
    total,
    totalUSD,
    transferable,
    transferableUSD,
    lockedVesting,
    lockedVestingUSD,
    lockedDemocracy,
    lockedDemocracyUSD,
    reserved,
    reservedUSD,
  }
}

type AssetsTableDataBalances = {
  id: string | u32
  total: BN
  totalUSD: BN
  transferable: BN
  transferableUSD: BN
  lockedVesting: BN
  lockedVestingUSD: BN
  lockedDemocracy: BN
  lockedDemocracyUSD: BN
  reserved: BN
  reservedUSD: BN
}
