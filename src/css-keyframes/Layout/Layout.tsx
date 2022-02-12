import React from "react";
import s from "~/css-keyframes/Layout/Layout.styles";

export const Layout: React.FC = (props) => {
  return <div className={s("container")}>{props.children}</div>;
};
