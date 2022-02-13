import { colors } from "~/colors";
import { createStylesheet } from "~/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    background: ${colors.gray300};
    border-top: 1px solid ${colors.gray700};
    height: 500px;
    display: flex;
    align-items: stretch;
  `,

  right: css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-basis: 0;
    flex-grow: 1;
  `,
}));
