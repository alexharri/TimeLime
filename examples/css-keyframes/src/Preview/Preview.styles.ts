import { colors } from "~/colors";
import { createStylesheet } from "~/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    flex-basis: 0;
    flex-grow: 1;
    position: relative;
    background: ${colors.dark500};
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