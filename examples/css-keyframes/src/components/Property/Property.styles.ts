import { colors } from "~examples/css-keyframes/colors";
import { cssVariables } from "~examples/css-keyframes/cssVariables";
import { createStylesheet } from "~examples/css-keyframes/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    height: 32px;
    border-radius: 4px;
    padding: 0 8px;
    display: flex;
    align-items: center;

    &--active {
      background: ${colors.gray600};
      border: 1px solid ${colors.light200};
    }
  `,

  label: css`
    font-family: ${cssVariables.fontFamily};
    color: ${colors.white500};
    flex-basis: 0;
    flex-grow: 1;
  `,

  keyframeButton: css`
    color: ${colors.gray700};
    border: none;
    background: transparent;
    padding: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: ${colors.light300};
    }

    &--active {
      color: ${colors.light700};

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: ${colors.light700};
      }

      &:active {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    &--selected {
      color: ${colors.blue500};

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: ${colors.blue500};
      }
    }
  `,

  arrowButton: css`
    border: none;
    background: transparent;
    padding: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.gray700};
    border-radius: 4px;
    cursor: default;

    &--active {
      color: ${colors.light700};
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &:active {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  `,
}));
