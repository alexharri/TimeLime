import { colors } from "~/core/colors";
import { createStylesheet } from "~/css-keyframes/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    flex-basis: 0;
    flex-grow: 1;
    position: relative;
  `,

  box: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
    background: ${colors.white500};
  `,
}));
