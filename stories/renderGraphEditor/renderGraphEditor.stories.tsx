import { ComponentMeta } from "@storybook/react";
import React, { useEffect, useRef } from "react";
import { renderGraphEditor } from "~/core/render/renderGraphEditor";
import { Timeline } from "~/types/timelineTypes";

export default {
  title: "API/renderGraphEditor",
} as ComponentMeta<React.ComponentType>;

export const RenderGraphEditor = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    const timeline: Timeline = {
      id: "test",
      keyframes: [
        {
          id: "0",
          controlPointLeft: null,
          controlPointRight: { tx: 0.25, value: 0, relativeToDistance: 40 },
          index: 10,
          reflectControlPoints: false,
          value: 50,
        },
        {
          id: "0",
          controlPointLeft: { tx: 0.5, relativeToDistance: 40, value: -15 },
          controlPointRight: null,
          index: 50,
          reflectControlPoints: false,
          value: 30,
        },
      ],
    };

    renderGraphEditor({
      ctx,
      length: 100,
      timelines: [timeline],
    });
  }, []);

  return <canvas ref={ref} width={800} height={400} />;
};
