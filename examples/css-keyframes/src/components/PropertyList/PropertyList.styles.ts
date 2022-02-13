import { colors } from "~examples/css-keyframes/colors";
import { createStylesheet } from "~examples/css-keyframes/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    background: ${colors.gray300};
    border-right: 1px solid ${colors.gray700};
    width: 280px;
    padding: 16px;
  `,
}));
