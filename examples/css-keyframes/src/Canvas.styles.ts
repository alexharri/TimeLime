import { createStylesheet } from "./utils/stylesheet";

export default createStylesheet(({ css }) => ({
  canvas: css`
    flex-basis: 0;
    flex-grow: 1;
    position: relative;
  `,
}));
