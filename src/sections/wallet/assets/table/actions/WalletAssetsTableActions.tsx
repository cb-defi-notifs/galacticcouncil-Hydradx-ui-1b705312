import { ReactComponent as BuyIcon } from "assets/icons/BuyIcon.svg"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"
import { ReactComponent as MoreIcon } from "assets/icons/MoreDotsIcon.svg"
import { ReactComponent as SellIcon } from "assets/icons/SellIcon.svg"
import { ReactComponent as TransferIcon } from "assets/icons/TransferIcon.svg"
//import { ReactComponent as ClaimIcon } from "assets/icons/ClaimIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/DollarIcon.svg"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown } from "components/Dropdown/Dropdown"
import { TableAction } from "components/Table/Table"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { isNotNil } from "utils/helpers"

type Props = {
  toggleExpanded: () => void
  symbol: string
  onBuyClick: (() => void) | undefined
  onSellClick: (() => void) | undefined
  onTransferClick: () => void
  onSetFeeAsPaymentClick: () => void
  couldBeSetAsPaymentFee: boolean
}

export const WalletAssetsTableActions = (props: Props) => {
  const { t } = useTranslation()

  const actionItems = [
    /*{
      key: "add",
      icon: <ClaimIcon />,
      label: t("wallet.assets.table.actions.claim"),
    },*/
    props.couldBeSetAsPaymentFee
      ? {
          key: "setAsFeePayment",
          icon: <DollarIcon />,
          label: t("wallet.assets.table.actions.payment.asset"),
        }
      : null,
  ].filter(isNotNil)

  return (
    <>
      <div sx={{ display: ["block", "none"] }}>
        <ButtonTransparent
          onClick={() => console.log("detail", props.symbol)}
          css={{ color: theme.colors.iconGray }}
        >
          <ChevronRightIcon />
        </ButtonTransparent>
      </div>
      <div
        sx={{
          flex: "row",
          gap: 10,
          display: ["none", "flex"],
          align: "center",
        }}
      >
        <TableAction
          icon={<BuyIcon />}
          onClick={props.onBuyClick}
          disabled={props.onBuyClick == null}
        >
          {t("wallet.assets.table.actions.buy")}
        </TableAction>
        <TableAction
          icon={<SellIcon />}
          onClick={props.onSellClick}
          disabled={props.onSellClick == null}
        >
          {t("wallet.assets.table.actions.sell")}
        </TableAction>
        <TableAction icon={<TransferIcon />} onClick={props.onTransferClick}>
          {t("wallet.assets.table.actions.transfer")}
        </TableAction>

        <Dropdown
          items={actionItems}
          onSelect={(item) => {
            if (item === "setAsFeePayment") {
              props.onSetFeeAsPaymentClick()
            }
          }}
        >
          <MoreIcon />
        </Dropdown>

        <ButtonTransparent
          onClick={props.toggleExpanded}
          css={{ color: theme.colors.iconGray }}
        >
          <ChevronDownIcon />
        </ButtonTransparent>
      </div>
    </>
  )
}
