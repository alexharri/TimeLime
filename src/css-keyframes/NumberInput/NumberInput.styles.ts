import { css } from "@emotion/css";
import { colors } from "~/core/colors";

const fontSize = 16;
const height = 24;
const sidePadding = 8;

export default {
  button: css`
    cursor: pointer;
    border: none;
    font-family: sans-serif;
    font-size: ${fontSize}px;
    color: ${colors.blue700};
    background-color: transparent;
    transition: background-color 0.3s;
    border-radius: 3px;
    line-height: ${height}px;
    padding: 0 ${sidePadding}px;
    outline: none;
    display: flex;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.1);
      cursor: ew-resize;
    }
  `,

  button__value: css`
    flex-grow: 1;
    text-align: right;
  `,

  container: css`
    height: 16px;
    display: inline-block;
    vertical-align: top;

    input {
      width: 50px;
    }
  `,

  input: css`
    box-sizing: border-box;
    height: ${height}px;
    color: white;
    outline: none;
    background-color: ${colors.dark300};
    border: 1px solid ${colors.blue700};
    font-size: ${fontSize}px;
    line-height: ${fontSize}px;
    padding: 4px ${sidePadding - 1}px 2px;
    border-radius: 3px;
    font-weight: 400;
    transform: translateY(-1px);

    &::selection {
      color: white;
      background: ${colors.blue500};
    }
  `,
};
