import { areMapsShallowEqual } from "map-fns";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent } from "~/types/commonTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

interface Options {
  e: SomeMouseEvent;
  timelineId: string;
  keyframe: TimelineKeyframe;
}

export function onMousedownKeyframe(
  actionOptions: ActionOptions,
  options: Options
) {
  const { e, timelineId, keyframe } = options;

  const additiveSelection = e.shiftKey;

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    keys: ["Shift"],
    translate: globalToNormal,
    beforeMove: (params) => {
      const { selection, ephemeral } = params;
      const { timelines } = params.primary.state;
      const { viewBounds, length } = params.view.state;

      const timelineSelection = selection.state[timelineId];

      const yBounds = getGraphEditorYBounds({ length, timelines, viewBounds });
      ephemeral.dispatch((actions) => actions.setFields({ yBounds }));

      if (additiveSelection) {
        selection.dispatch((actions) =>
          actions.toggleKeyframe(timelineId, keyframe.id)
        );
      } else if (!timelineSelection?.keyframes[keyframe.id]) {
        selection.dispatch((actions) => actions.clear(timelineId));
        selection.dispatch((actions) =>
          actions.toggleKeyframe(timelineId, keyframe.id)
        );
      }
    },
    mouseMove: (params, { moveVector, keyDown }) => {
      const { ephemeral } = params;
      let { x, y } = moveVector.normal;

      if (keyDown.Shift) {
        if (Math.abs(moveVector.global.x) > Math.abs(moveVector.global.y)) {
          y = 0;
        } else {
          x = 0;
        }
      }

      const keyframeShift = Vec2.new(Math.round(x), y);
      ephemeral.dispatch((actions) => actions.setFields({ keyframeShift }));
    },
    mouseUp: (params) => {
      const { ephemeral, primary, selection } = params;
      const { keyframeShift } = ephemeral.state;

      if (!keyframeShift) {
        // The mouse did not move. The selection may have been modified.
        params.submit({
          name: "Modify selection",
          shouldAddToStack: (prev, next) =>
            !areMapsShallowEqual(prev.selection, next.selection),
        });
        return;
      }

      const { timelines } = primary.state;

      const timeline = timelines[timelineId];
      const timelineSelection = selection.state[timelineId];

      const nextTimeline = applyTimelineKeyframeShift({
        keyframeShift,
        timeline,
        timelineSelection,
      });

      primary.dispatch((actions) => actions.setTimeline(nextTimeline));
      params.submit({ name: "Move keyframe", allowSelectionShift: true });
    },
  });
}
