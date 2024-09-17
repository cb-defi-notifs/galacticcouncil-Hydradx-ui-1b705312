import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import React, { ReactNode } from "react"
import { STrigger, SContent, SItem } from "./Dropdown.styled"

export type TDropdownItem = {
  key: string
  icon?: ReactNode
  label: ReactNode
  onSelect?: () => void
  disabled?: boolean
}

export type DropdownProps = {
  items: Array<TDropdownItem>
  children: ReactNode
  onSelect: (key: TDropdownItem) => void
  asChild?: boolean
  align?: "start" | "center" | "end"
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  children,
  onSelect,
  asChild,
  align,
}) => {
  return (
    <DropdownMenu.Root>
      {asChild ? (
        <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      ) : (
        <STrigger disabled={!items.length}>{children}</STrigger>
      )}
      <DropdownMenu.Portal>
        <SContent sideOffset={8} align={align}>
          {items.map((i) => (
            <SItem key={i.key} onClick={() => onSelect(i)}>
              {i.icon}
              {i.label}
            </SItem>
          ))}
        </SContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
