import { colors } from "~/core/colors";
import { createStylesheet } from "~/css-keyframes/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    background: ${colors.gray300};
    border-top: 1px solid ${colors.gray700};
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
    align-items: stretch;
  `,

  right: css`
    flex-basis: 0;
    flex-grow: 1;
  `,
}));
