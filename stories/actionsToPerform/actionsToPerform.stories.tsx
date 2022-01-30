import { ComponentMeta } from "@storybook/react";
import React, { useEffect, useMemo, useRef } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { renderGraphEditor } from "~/core/render/renderGraphEditor";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { Timeline } from "~/types/timelineTypes";

export default {
  title: "API/actionsToPerform",
} as ComponentMeta<React.ComponentType>;

export const LogActionToPerform = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  const length = 200;
  const timeline = useMemo(() => {
    const timeline: Timeline = {
      id: "test",
      keyframes: curvesToKeyframes([
        [
          [0, 0],
          [20, 10],
          [80, 90],
          [100, 100],
        ],
        [
          [100, 100],
          [140, 121],
          [180, 30],
          [200, 100],
        ],
      ]),
    };
    return timeline;
  }, []);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    renderGraphEditor({ ctx, length, timelines: { [timeline.id]: timeline } });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    const viewport = ref.current?.getBoundingClientRect();

    if (!viewport) {
      return;
    }

    const actionToPerform = getActionToPerformOnMouseDown({
      e,
      length,
      timelines: { [timeline.id]: timeline },
      viewport,
    });
    console.log(actionToPerform);
  };

  return (
    <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />
  );
};
