import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { requestAction } from "~/core/state/requestAction";
import { PerformActionOptions } from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { createGlobalToNormalFn } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent } from "~/types/commonTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

interface Options {
  e: SomeMouseEvent;
  timelineId: string;
  keyframe: TimelineKeyframe;
}

export function onMousedownKeyframe(
  performOptions: PerformActionOptions,
  options: Options
) {
  const { e, timelineId, keyframe } = options;

  requestAction({ performOptions }, (params) => {
    const { primary, selection, view, ephemeral } = params;

    const { timelines } = primary.state;
    const { length, viewBounds, viewport } = view.state;

    const globalToNormal = createGlobalToNormalFn({
      length,
      viewport,
      viewBounds,
      timelines,
    });

    const initialMousePosition = Vec2.fromEvent(e).apply(globalToNormal);

    const yBounds = getGraphEditorYBounds({ length, timelines, viewBounds });
    ephemeral.dispatch((actions) => actions.setFields({ yBounds }));

    selection.dispatch((actions) => actions.clear(timelineId));
    selection.dispatch((actions) =>
      actions.toggleKeyframe(timelineId, keyframe.id)
    );

    params.addListener.repeated("mousemove", (e) => {
      const mousePosition = Vec2.fromEvent(e).apply(globalToNormal);
      const moveVector = mousePosition.sub(initialMousePosition);

      const keyframeShift = Vec2.new(Math.round(moveVector.x), moveVector.y);
      ephemeral.dispatch((actions) => actions.setFields({ keyframeShift }));
    });

    params.addListener.once("mouseup", () => {
      const { keyframeShift } = ephemeral.state;

      if (!keyframeShift) {
        // The mouse did not move
        params.cancel();
        return;
      }

      const timeline = timelines[timelineId];
      const timelineSelection = selection.state[timelineId];

      const nextTimeline = applyTimelineKeyframeShift({
        keyframeShift,
        timeline,
        timelineSelection,
      });

      primary.dispatch((actions) => actions.setTimeline(nextTimeline));
      params.submit();
    });
  });
}
