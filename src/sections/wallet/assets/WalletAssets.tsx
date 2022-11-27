import { useAssetsTableData } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { WalletAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton"
import { WalletAssetsTable } from "sections/wallet/assets/table/WalletAssetsTable"
import { useAccountStore } from "state/store"
import { WalletAssetsHeader } from "./WalletAssetsHeader"
import { WalletLiquidityPositionsSkeleton } from "./table/skeleton/WalletLiquidityPositionsSkeleton"

export const WalletAssets = () => {
  const { account } = useAccountStore()
  const assetTableQuery = useAssetsTableData()

  const queries = [assetTableQuery]
  const isLoading = queries.some((query) => query.isLoading)
  const hasData = queries.every((query) => query.data)

  return (
    <div sx={{ mt: [34, 56] }}>
      {!account ? (
        <WalletAssetsTablePlaceholder />
      ) : isLoading ? (
        <>
          <WalletAssetsHeader isLoading={isLoading} />
          <div
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <WalletAssetsTableSkeleton />
            <WalletLiquidityPositionsSkeleton />
          </div>
        </>
      ) : (
        hasData && (
          <>
            <WalletAssetsHeader data={assetTableQuery.data} />
            <div
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <WalletAssetsTable data={assetTableQuery.data} />
            </div>
          </>
        )
      )}
    </div>
  )
}
