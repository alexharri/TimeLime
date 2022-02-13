import { colors } from "~/core/colors";
import { createStylesheet } from "~/css-keyframes/src/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    background: ${colors.gray300};
    border-right: 1px solid ${colors.gray700};
    width: 244px;
    padding: 16px;
  `,
}));
