import { useUsdPeggedAsset } from "api/asset"
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
import { useTokensLocks } from "../../../../../api/balances"
import BigNumber from "bignumber.js"

export const useAssetsTableData = () => {
  const { account } = useAccountStore()
  const accountBalances = useAccountBalances(account?.address)
  const tokenIds = accountBalances.data?.balances
    ? [NATIVE_ASSET_ID, ...accountBalances.data.balances.map((b) => b.id)]
    : []
  const balances = useAssetsBalances()
  const assets = useAssetDetailsList(tokenIds)

  const queries = [assets, balances]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (isLoading || !assets.data || !balances.data) return []

    const res = assets.data.map((asset) => {
      const balance = balances.data?.find(
        (b) => b.id.toString() === asset.id.toString(),
      )

      if (!balance) return null

      return {
        id: asset.id?.toString(),
        symbol: asset.name,
        name: getAssetName(asset.name),
        transferable: balance.transferable,
        transferableUSD: balance.transferableUSD,
        total: balance.total,
        totalUSD: balance.totalUSD,
        locked: balance.locked,
        lockedUSD: balance.lockedUsd,
        origin: "TODO",
        assetType: asset.assetType,
      }
    })

    return res.filter((x): x is AssetsTableData => x !== null)
  }, [assets.data, balances.data, isLoading])

  return { data, isLoading }
}

export const useAssetsBalances = () => {
  const { account } = useAccountStore()
  const accountBalances = useAccountBalances(account?.address)
  const tokenIds = accountBalances.data?.balances
    ? [NATIVE_ASSET_ID, ...accountBalances.data.balances.map((b) => b.id)]
    : []
  const assetMetas = useAssetMetaList(tokenIds)
  const usd = useUsdPeggedAsset()
  const spotPrices = useSpotPrices(tokenIds, usd.data?.id)
  const locksQueries = useTokensLocks(tokenIds)

  const queries = [
    accountBalances,
    assetMetas,
    usd,
    ...spotPrices,
    ...locksQueries,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !accountBalances.data ||
      !assetMetas.data ||
      spotPrices.some((q) => !q.data) ||
      locksQueries.some((q) => !q.data)
    )
      return undefined

    const locks = locksQueries.reduce(
      (
        acc: {
          id: string
          amount: BigNumber
        }[],
        cur,
      ) => {
        if (cur.data) {
          acc.push(...cur.data)
        }
        return acc
      },
      [],
    )

    const tokens: (AssetsTableDataBalances | null)[] =
      accountBalances.data.balances.map((ab) => {
        const id = ab.id
        const spotPrice = spotPrices.find((sp) => id.eq(sp.data?.tokenIn))
        const meta = assetMetas.data.find((am) => id.eq(am?.id))
        const lock = locks.find((lock) => id.eq(lock.id))

        if (!spotPrice?.data || !meta) return null

        const dp = BN_10.pow(meta.decimals.toBigNumber())
        const free = ab.data.free.toBigNumber()
        const reserved = ab.data.reserved.toBigNumber()
        const frozen = ab.data.frozen.toBigNumber()

        const total = free.plus(reserved).div(dp)
        const totalUSD = total.times(spotPrice.data.spotPrice)
        const transferable = free.minus(frozen).div(dp)
        const transferableUSD = transferable.times(spotPrice.data.spotPrice)

        const locked = (lock?.amount ?? BN_0).div(dp)
        const lockedUsd = locked.times(spotPrice.data.spotPrice)

        return {
          id,
          total,
          totalUSD,
          transferable,
          transferableUSD,
          locked,
          lockedUsd,
        }
      })

    const nativeBalance = accountBalances.data.native.data
    const nativeDecimals = assetMetas.data
      .find((am) => am?.id === NATIVE_ASSET_ID)
      ?.decimals.toBigNumber()
    const nativeSpotPrice = spotPrices.find(
      (sp) => sp.data?.tokenIn === NATIVE_ASSET_ID,
    )?.data?.spotPrice

    const nativeLock = locks.find((lock) => lock.id === NATIVE_ASSET_ID)?.amount

    const native = getNativeBalances(
      nativeBalance,
      nativeDecimals,
      nativeSpotPrice,
      nativeLock,
    )

    return [native, ...tokens].filter(
      (x): x is AssetsTableDataBalances => x !== null,
    )
  }, [accountBalances.data, assetMetas, spotPrices, locksQueries])

  return { data, isLoading }
}

const getNativeBalances = (
  balance: PalletBalancesAccountData,
  decimals?: BN,
  spotPrice?: BN,
  lock?: BN,
): AssetsTableDataBalances | null => {
  if (!decimals || !spotPrice) return null

  const dp = BN_10.pow(decimals)
  const free = balance.free.toBigNumber()
  const reserved = balance.reserved.toBigNumber()
  const feeFrozen = balance.feeFrozen.toBigNumber()
  const miscFrozen = balance.miscFrozen.toBigNumber()

  const total = free.plus(reserved).div(dp)
  const totalUSD = total.times(spotPrice)
  const transferable = free.minus(BN.max(feeFrozen, miscFrozen)).div(dp)
  const transferableUSD = transferable.times(spotPrice)

  const locked = (lock ?? BN_0).div(dp)
  const lockedUsd = locked.times(spotPrice)

  return {
    id: NATIVE_ASSET_ID,
    total,
    totalUSD,
    transferable,
    transferableUSD,
    locked,
    lockedUsd,
  }
}

type AssetsTableDataBalances = {
  id: string | u32
  total: BN
  totalUSD: BN
  transferable: BN
  transferableUSD: BN
  locked: BN
  lockedUsd: BN
}
