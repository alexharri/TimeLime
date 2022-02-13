import React from "react";
import { AppProps } from "next/app";

// organize-imports-ignore

import "~examples/css-keyframes/css/reset.css";
import "~examples/css-keyframes/css/base.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
