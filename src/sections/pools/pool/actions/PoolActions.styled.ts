import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { theme } from "theme"

export const SButtonOpen = styled(IconButton)<{
  isActive?: boolean
  disabled?: boolean
}>`
  width: 41px;
  height: 41px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: ${theme.colors.white};
  border-color: ${theme.colors.brightBlue300};
  background-color: ${({ isActive }) =>
    isActive
      ? theme.colors.brightBlue400
      : `rgba(${theme.rgbColors.primaryA15}, 0.12)`};

  &:hover {
    color: ${theme.colors.white};
    background: rgba(${theme.rgbColors.brightBlue500}, 0.9);

    border: 1px solid ${theme.colors.brightBlue100};
  }

  &:disabled,
  &[disabled] {
    color: ${theme.colors.darkBlue300};
    background: rgba(${theme.rgbColors.alpha0}, 0.06);

    border: 1px solid ${theme.colors.darkBlue300};

    opacity: 0.7;

    cursor: not-allowed;
  }

  > * {
    transition: all ${theme.transitions.default};
    transform: ${({ isActive }) => isActive && "rotate(180deg)"};
  }
`

export const SActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;

  margin: 0 -20px;
  padding: 0 20px;

  background: rgba(${theme.rgbColors.gray}, 0.69);

  @media ${theme.viewport.gte.sm} {
    margin: 0;
    margin-left: auto;
    width: 340px;

    background: inherit;
  }
`
