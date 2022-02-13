import { colors } from "~/colors";
import { cssVariables } from "~/cssVariables";
import { createStylesheet } from "~/utils/stylesheet";

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
  `,
}));
