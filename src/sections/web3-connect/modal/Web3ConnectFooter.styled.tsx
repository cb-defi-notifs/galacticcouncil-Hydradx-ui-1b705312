import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: var(--modal-content-padding);
  padding-top: 0;
`

export const SLogoutContainer = styled.div`
  display: flex;

  gap: 2px;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.basic500};
  transition: color ${theme.transitions.default};

  &:hover {
    color: ${theme.colors.basic400};
  }
`

export const SSwitchButton = styled(ButtonTransparent)`
  padding: 12px;
  border-radius: 4px;
  border: 1px solid ${theme.colors.basic800};
  transition: ${theme.transitions.default};

  &:hover {
    border: 1px solid ${theme.colors.basic700};
  }
`

export const SSwitchText = styled(Text)`
  color: ${theme.colors.brightBlue500};
  display: flex;
  align-items: center;
  justify-content: center;
`
