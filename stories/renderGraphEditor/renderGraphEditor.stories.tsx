import { ComponentMeta } from "@storybook/react";
import React, { useEffect, useRef } from "react";
import { renderGraphEditor } from "~/core/render/renderGraphEditor";
import { Timeline } from "~/types/timelineTypes";

export default {
  title: "API/renderGraphEditor",
} as ComponentMeta<React.ComponentType>;

export const BasicExample = () => {
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
          id: "1",
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

export const Overlap = () => {
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
          controlPointRight: {
            relativeToDistance: 100,
            tx: 0.2,
            value: 0,
          },
          index: 0,
          reflectControlPoints: false,
          value: 0,
        },
        {
          id: "1",
          controlPointLeft: {
            relativeToDistance: 100,
            tx: 0.8,
            value: 10,
          },
          controlPointRight: null,
          index: 100,
          reflectControlPoints: false,
          value: 100,
        },
      ],
    };

    renderGraphEditor({
      ctx,
      length: 100,
      timelines: [timeline],
      viewBounds: [0.3, 0.7],
    });
  }, []);

  return <canvas ref={ref} width={800} height={400} />;
};
