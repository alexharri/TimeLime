import { createStylesheet } from "~/css-keyframes/src/utils/stylesheet";

export default createStylesheet(({ css }) => ({
  container: css`
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
  `,
}));
