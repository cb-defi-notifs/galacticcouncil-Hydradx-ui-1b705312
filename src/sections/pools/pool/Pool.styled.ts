import styled from "@emotion/styled"
import { theme } from "theme"
import InfoIcon from "assets/icons/InfoIconBlue.svg?react"
import { css } from "@emotion/react"

export const SContainer = styled.div`
  width: calc(100% + 24px);

  border-radius: 4px;
  background-color: ${theme.colors.darkBlue700};
  box-shadow: ${theme.shadows.contentBox};

  overflow: hidden;

  margin: 0 -12px;

  position: relative;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: 4px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      180deg,
      rgba(102, 151, 227, 0.35) 0%,
      rgba(68, 109, 174, 0.3) 66.67%,
      rgba(91, 151, 245, 0) 99.99%,
      rgba(158, 167, 180, 0) 100%
    );

    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @media ${theme.viewport.gte.sm} {
    margin: unset;
    width: 100%;
  }
`

export const SGridContainer = styled.div`
  position: relative;

  display: grid;
  grid-column-gap: 0px;
  grid-row-gap: 20px;

  padding: 20px;

  grid-template-areas: "details" "values" "incentives" "capacity" "actions";

  @media ${theme.viewport.gte.sm} {
    padding: 30px;

    display: grid;

    grid-template-areas:
      "details incentives actions"
      "values incentives actions"
      "capacity capacity capacity";
  }
`

export const SPositions = styled.div`
  background: rgba(${theme.rgbColors.darkBlue900}, 0.4);
  width: 100%;
  padding: 20px 12px;

  @media ${theme.viewport.gte.sm} {
    padding: 20px 30px;
  }
`

export const SInfoIcon = styled(InfoIcon)`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;
  flex-shrink: 0;

  color: ${theme.colors.pink600};
  background: transparent;

  transition: all ${theme.transitions.default};

  border-radius: 9999px;

  & > path:nth-of-type(1) {
    fill: url(#paint0_linear_16038_17627);
  }

  & > path:nth-of-type(2) {
    fill: ${theme.colors.brightBlue300};
  }

  [data-state*="open"] > & {
    cursor: pointer;

    & > path:nth-of-type(1) {
      fill: #57b3eb;
      fill-opacity: 1;
    }

    & > path:nth-of-type(2) {
      fill: #00041d;
    }
  }
`
