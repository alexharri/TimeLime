import { colors } from "~/core/colors";
import { cssVariables } from "~/css-keyframes/cssVariables";
import { createStylesheet } from "~/css-keyframes/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    height: 32px;
    padding: 0 8px;
    display: flex;
    align-items: center;
  `,

  label: css`
    font-size: 12px;
    margin-right: 16px;
    color: ${colors.white500};
    font-family: ${cssVariables.fontFamily};
  `,
}));
