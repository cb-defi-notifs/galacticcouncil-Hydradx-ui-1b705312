import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { QUERY_KEYS } from "utils/queryKeys"

const getIsEvmAccountBound = (api: ApiPromise, address: string) => {
  return async () => {
    const result = await api.rpc.state.call(
      "EvmAccountsApi_bound_account_id",
      address,
    )

    const isBound = !result.isEmpty
    return isBound
  }
}

export function useIsEvmAccountBound(address: string) {
  const { api, isLoaded } = useRpcProvider()

  return useQuery({
    enabled: isLoaded && !!address,
    queryKey: QUERY_KEYS.evmBoundAccountId(address),
    queryFn: getIsEvmAccountBound(api, address),
  })
}
