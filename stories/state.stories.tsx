import "./preventGlobals";

import { useEffect } from "@storybook/addons";
import { ComponentMeta } from "@storybook/react";
import { mapMap } from "map-fns";
import React, { useCallback, useRef } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { renderGraphEditor } from "~/core/render/renderGraphEditor";
import {
  EphemeralState,
  PrimaryState,
  RenderState,
  ViewState,
} from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { Timeline } from "~/types/timelineTypes";

export default {
  title: "State/Primary, View, Ephemeral",
} as ComponentMeta<React.ComponentType>;

export const Test = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  const primaryState = useRef<PrimaryState>(null!);
  if (!primaryState.current) {
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
    primaryState.current = {
      timelineState: { timelines: { [timeline.id]: timeline } },
      timelineSelectionState: {},
    };
  }

  const viewState = useRef<ViewState>({
    length: 200,
    viewBounds: [0, 1],
    viewport: { left: 0, top: 0, width: 0, height: 0 },
  });

  const ephemeralState = useRef<EphemeralState>({});

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }

    viewState.current.viewport = canvas.getBoundingClientRect();
    render({
      primary: primaryState.current,
      view: viewState.current,
      ephemeral: {},
    });
  }, [ref.current]);

  const render = useCallback((renderState: RenderState) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    const { timelineState, timelineSelectionState } = renderState.primary;
    let { timelines } = timelineState;

    const { length, viewBounds } = viewState.current;

    const { keyframeShift, yBounds } = ephemeralState.current;

    if (keyframeShift) {
      timelines = mapMap(timelines, (timeline) =>
        applyTimelineKeyframeShift({
          timeline,
          timelineSelection: timelineSelectionState[timeline.id],
          keyframeShift,
        })
      );
    }

    console.log(timelines);

    renderGraphEditor({
      ctx,
      length,
      timelines,
      timelineSelectionState,
      yBounds,
      viewBounds,
    });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    const {
      timelineState: { timelines },
    } = primaryState.current;
    const { length, viewport } = viewState.current;

    const actionToPerform = getActionToPerformOnMouseDown({
      e,
      length,
      timelines,
      viewport,
    });

    console.log(actionToPerform);

    if (actionToPerform.type !== "mousedown_keyframe") {
      return;
    }
  };

  return (
    <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />
  );
};
