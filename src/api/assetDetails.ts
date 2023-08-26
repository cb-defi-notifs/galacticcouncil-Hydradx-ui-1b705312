import { ApiPromise } from "@polkadot/api"
import { u32, u8 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { PalletAssetRegistryAssetType } from "@polkadot/types/lookup"
import { useQuery } from "@tanstack/react-query"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { useAccountStore } from "state/store"
import {
  DEPOSIT_CLASS_ID,
  NATIVE_ASSET_ID,
  useApiPromise,
  useTradeRouter,
} from "utils/api"
import { BN_0 } from "utils/constants"
import { Maybe, isNotNil, normalizeId, isApiLoaded } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { getAccountBalances, useAccountBalances } from "./accountBalances"
import { getTokenLock } from "./balances"
import { getApiIds } from "./consts"
import { getHubAssetTradability, getOmnipoolAssets } from "./omnipool"
import { getAcceptedCurrency, getAccountCurrency } from "./payments"
import BN from "bignumber.js"

export const useAssetDetails = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.assets, getAssetDetails(api), {
    enabled: !!id && !!isApiLoaded(api),
    select: (data) => data.find((i) => i.id === id?.toString()),
  })
}

type TAssetsDetails = {
  id: string
  name: string
  assetType: PalletAssetRegistryAssetType["type"]
  symbol: string
  decimals: u32 | u8 | undefined
}

type TAssetDetails = {
  id: string
  name: string
  assetType: PalletAssetRegistryAssetType["type"]
  existentialDeposit: BN
}

interface AssetDetailsListFilter {
  assetType: PalletAssetRegistryAssetType["type"][]
}

export const useAssetTable = () => {
  const api = useApiPromise()
  const tradeRouter = useTradeRouter()
  const { account } = useAccountStore()

  return useQuery(
    QUERY_KEYS.assetsTable(account?.address),
    async () => {
      if (!account?.address) return undefined

      const balances = await getAccountBalances(api, account.address)()

      const allAcceptedTokens = [
        NATIVE_ASSET_ID,
        ...(balances.balances ?? []).map((balance) => balance.id),
      ].map((id) => getAcceptedCurrency(api, id)())

      const acceptedTokens = await Promise.all(allAcceptedTokens)

      const accountTokenId = await getAccountCurrency(api, account.address)()

      const apiIds = await getApiIds(api)()

      const allAssets = await getAssetsDetails(api)()

      const tradeAssets = await tradeRouter.getAllAssets()

      const tokenLockPromises = acceptedTokens.map((token) =>
        getTokenLock(api, account.address, token.id)(),
      )
      const tokenLocks = await Promise.all(tokenLockPromises)

      const omnipoolAssets = await getOmnipoolAssets(api)()

      const hubAssetTradability = await getHubAssetTradability(api)()

      return {
        balances,
        allAssets,
        accountTokenId,
        tradeAssets,
        acceptedTokens,
        tokenLocks,
        apiIds,
        omnipoolAssets,
        hubAssetTradability,
      }
    },
    { enabled: !!account?.address },
  )
}

export const useAssetDetailsList = (
  ids?: Maybe<u32 | string>[],
  filter: AssetDetailsListFilter = {
    assetType: ["Token"],
  },
  noRefresh?: boolean,
) => {
  const api = useApiPromise()
  const normalizedIds = ids?.filter(isNotNil).map(normalizeId)

  return useQuery(
    noRefresh ? QUERY_KEYS.assets : QUERY_KEYS.assetsLive,
    getAssetDetails(api),
    {
      select: (data) => {
        const normalized =
          normalizedIds != null
            ? data.filter((i) => normalizedIds?.includes(i.id))
            : data

        return normalized.filter((asset) =>
          filter.assetType.includes(asset.assetType),
        )
      },
      enabled: !!isApiLoaded(api),
    },
  )
}

export const useAssetAccountDetails = (
  address: Maybe<AccountId32 | string>,
) => {
  const accountBalances = useAccountBalances(address)

  const ids = accountBalances.data?.balances
    ? [NATIVE_ASSET_ID, ...accountBalances.data.balances.map((b) => b.id)]
    : []

  return useAssetDetailsList(ids)
}

const getAssetDetails = (api: ApiPromise) => async () => {
  const [system, entries] = await Promise.all([
    api.rpc.system.properties(),
    api.query.assetRegistry.assets.entries(),
  ])

  const assets = entries.reduce<TAssetDetails[]>((acc, [key, dataRaw]) => {
    const data = dataRaw.unwrap()

    if (data.assetType.isToken) {
      acc.push({
        id: key.args[0].toString(),
        name: data.name.toUtf8(),
        assetType: data.assetType.type,
        existentialDeposit: data.existentialDeposit.toBigNumber(),
      })
    }
    return acc
  }, [])

  if (!assets.find((i) => i.id === NATIVE_ASSET_ID)) {
    assets.push({
      id: NATIVE_ASSET_ID,
      name: system.tokenSymbol.unwrap()[0].toString(),
      assetType: "Token",
      existentialDeposit: BN_0,
    })
  }

  return assets
}

export const getAssetsDetails = (api: ApiPromise) => async () => {
  const [system, rawAssetsData, rawAssetsMeta] = await Promise.all([
    api.rpc.system.properties(),
    api.query.assetRegistry.assets.entries(),
    api.query.assetRegistry.assetMetadataMap.entries(),
  ])

  const assetsMeta: Array<{
    id: string
    symbol: string
    decimals: u8 | u32
  }> = rawAssetsMeta.map(([key, data]) => {
    return {
      id: key.args[0].toString(),
      symbol: data.unwrap().symbol.toUtf8(),
      decimals: data.unwrap().decimals,
    }
  })

  if (!assetsMeta.find((i) => i.id === NATIVE_ASSET_ID)) {
    const [decimals] = system.tokenDecimals.unwrap()
    const [symbol] = system.tokenSymbol.unwrap()

    assetsMeta.push({
      id: NATIVE_ASSET_ID,
      symbol: symbol.toString(),
      decimals,
    })
  }

  const assets = rawAssetsData.reduce<TAssetsDetails[]>(
    (acc, [key, dataRaw]) => {
      const id = key.args[0].toString()
      const data = dataRaw.unwrap()

      if (data.assetType.isToken) {
        const { symbol = "N/A", decimals } =
          assetsMeta.find((assetMeta) => assetMeta.id.toString() === id) || {}

        acc.push({
          id,
          name: data.name.toUtf8() || getAssetName(symbol),
          assetType: data.assetType.type,
          symbol,
          decimals,
        })
      }

      return acc
    },
    [],
  )

  if (!assets.find((i) => i.id === NATIVE_ASSET_ID)) {
    const { symbol = "N/A", decimals } =
      assetsMeta.find(
        (assetMeta) => assetMeta.id.toString() === NATIVE_ASSET_ID,
      ) || {}

    assets.push({
      id: NATIVE_ASSET_ID,
      name: system.tokenSymbol.unwrap()[0].toString() || getAssetName(symbol),
      assetType: "Token",
      symbol,
      decimals,
    })
  }

  return assets
}

export const useAssetList = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.assetList, async () => {
    const [assets, details] = await Promise.all([
      api.query.omnipool.assets.entries(),
      getAssetsDetails(api)(),
    ])

    const list = assets.map(([key]) => {
      const id = key.args[0].toString()
      return details.find((d) => d.id === id)
    })

    return list
      .filter(isNotNil)
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
  })
}

export const useAssetsLocation = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.assetsLocation, getAssetsLocation(api))
}

const getAssetsLocation = (api: ApiPromise) => async () => {
  const [metas, locationsRaw] = await Promise.all([
    api.query.assetRegistry.assetMetadataMap.entries(),
    api.query.assetRegistry.assetLocations.entries(),
  ])

  const nativeToken = {
    id: NATIVE_ASSET_ID,
    parachainId: undefined,
    symbol: "HDX",
  }

  const hubToken = {
    id: DEPOSIT_CLASS_ID,
    parachainId: undefined,
    symbol: "LRNA",
  }

  const locations = locationsRaw.map(([key, raw]) => {
    const id = key.args[0].toString()
    const data = raw.unwrap()
    const type = data.interior.type

    const symbol = metas
      .find(([key]) => key.args[0].toString() === id)?.[1]
      .unwrap()
      .symbol.toUtf8()

    if (data.interior && type !== "Here") {
      const xcm = data.interior[`as${type}`]

      const parachainId = !Array.isArray(xcm)
        ? xcm.asParachain.unwrap().toNumber()
        : xcm
            .find((el) => el.isParachain)
            ?.asParachain.unwrap()
            .toNumber()

      return {
        id,
        parachainId,
        symbol,
      }
    }

    return {
      id: key.args[0].toString(),
      parachainId: undefined,
      symbol,
    }
  })

  return [nativeToken, hubToken, ...locations]
}
