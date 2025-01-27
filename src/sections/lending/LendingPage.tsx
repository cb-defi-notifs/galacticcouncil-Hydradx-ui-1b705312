import { Navigate, Outlet } from "@tanstack/react-location"
import { useRpcProvider } from "providers/rpcProvider"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { LendingDashboardSkeleton } from "sections/lending/skeleton/LendingDashboardSkeleton"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"
import { LINKS } from "utils/navigation"

export const LendingPageIndex = () => {
  const { user, loading } = useAppDataContext()

  if (loading) {
    return <LendingDashboardSkeleton />
  }

  if (user.netWorthUSD === "0") {
    return <Navigate to={LINKS.borrowMarkets} />
  }

  return <Navigate to={LINKS.borrowDashboard} />
}

export const LendingPage = () => {
  useMarketChangeSubscription()

  const { isLoaded } = useRpcProvider()

  if (!isLoaded) {
    return <LendingDashboardSkeleton />
  }

  return (
    <LendingPageProviders>
      <Outlet />
    </LendingPageProviders>
  )
}
