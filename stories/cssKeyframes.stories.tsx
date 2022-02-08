import React from "react";
import { ComponentMeta } from "@storybook/react";
import { CSSKeyframes } from "~/css-keyframes/CSSKeyframe";

export default {
  title: "Examples/CSS Keyframes",
} as ComponentMeta<React.ComponentType>;

export const Default = () => {
  return <CSSKeyframes />;
};
