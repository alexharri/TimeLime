import { MOVE_ACTION_PAN_FAC } from "~/core/constants";
import { getGraphEditorYBoundsFromActionOptions } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { applyNewControlPointShift } from "~/core/timeline/applyNewControlPointShift";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getViewportXUpperLower, getViewportYUpperLower } from "~/core/utils/viewportUtils";
import { shiftViewBoundsByX } from "~/core/utils/viewUtils";
import { SomeMouseEvent } from "~/types/commonTypes";
import { NewControlPointShift, TimelineKeyframe } from "~/types/timelineTypes";

interface Options {
  e: SomeMouseEvent;
  timelineId: string;
  keyframe: TimelineKeyframe;
}
export function onAltMousedownKeyframe(actionOptions: ActionOptions, options: Options) {
  const { e, timelineId, keyframe } = options;

  const yBounds = getGraphEditorYBoundsFromActionOptions(actionOptions);
  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const k = keyframe;
  const keyframeIndex = actionOptions.initialState.primary.timelines[
    timelineId
  ].keyframes.findIndex((k) => k.id === keyframe.id);

  // Global-to-Normal multiplier
  const normalFac = globalToNormal(Vec2.new(0, 0)).sub(globalToNormal(Vec2.new(1, 1)));

  let yPan = 0;
  let xPan = 0;

  let direction!: "left" | "right";

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,
    keys: ["Shift"],
    beforeMove: (params) => {
      const { primary, selection, ephemeral } = params;

      const timelineList = Object.values(primary.state.timelines);

      for (const timeline of timelineList) {
        selection.dispatch((actions) => actions.clear(timeline.id));
        selection.dispatch((actions) => actions.addKeyframes(options.timelineId, [k.id]));
      }

      ephemeral.dispatch((actions) => actions.setFields({ yBounds }));

      // When creating new control points, they are always reflected
      primary.dispatch((actions) =>
        actions.setKeyframeReflectControlPoints(timelineId, keyframeIndex, true),
      );
    },
    tickShouldUpdate: (params, { mousePosition }) => {
      const { viewport } = params.view.state;
      const [yUpper, yLower] = getViewportYUpperLower(viewport, mousePosition.global);
      const [xUpper, xLower] = getViewportXUpperLower(viewport, mousePosition.global);
      return !!(yUpper || yLower || xUpper || xLower);
    },
    mouseMove: (params, { moveVector, mousePosition, keyDown, firstMove }) => {
      if (firstMove) {
        direction = moveVector.global.x > 0 ? "right" : "left";
      }

      const { ephemeral, view } = params;
      const { viewport } = view.state;

      const [xUpper, xLower] = getViewportXUpperLower(viewport, mousePosition.global);
      const [yUpper, yLower] = getViewportYUpperLower(viewport, mousePosition.global);

      if (yLower) {
        yPan -= yLower * normalFac.y * MOVE_ACTION_PAN_FAC;
      } else if (yUpper) {
        yPan += yUpper * normalFac.y * MOVE_ACTION_PAN_FAC;
      }
      if (xLower) {
        xPan -= xLower * normalFac.x * MOVE_ACTION_PAN_FAC;
      } else if (xUpper) {
        xPan += xUpper * normalFac.x * MOVE_ACTION_PAN_FAC;
      }

      if (xLower || xUpper || yLower || yUpper) {
        const pan = Vec2.new(xPan, yPan);
        ephemeral.dispatch((actions) => actions.setFields({ pan }));
      }

      let { x, y } = moveVector.normal;

      x += xPan;
      y += yPan;

      if (keyDown.Shift) {
        y = 0;
      }

      const newControlPointShift: NewControlPointShift = {
        direction,
        timelineId,
        keyframeId: keyframe.id,
        shiftVector: Vec2.new(x, y),
      };
      ephemeral.dispatch((actions) => actions.setFields({ newControlPointShift }));
    },
    mouseUp: (params) => {
      const { primary, view, ephemeral } = params;
      const { newControlPointShift } = ephemeral.state;

      const timeline = primary.state.timelines[timelineId];

      if (!newControlPointShift) {
        // Alt click on keyframe. Remove current control points if they exist.

        const keyframe = timeline.keyframes[keyframeIndex];
        if (!keyframe.controlPointLeft && !keyframe.controlPointRight) {
          // No keyframes to remove. Cancel.
          params.cancel();
          return;
        }

        primary.dispatch((actions) =>
          actions.removeKeyframeControlPoints(timelineId, keyframeIndex),
        );
        params.submit({ name: "Remove keyframe control points", allowSelectionShift: true });
        return;
      }

      const newTimeline = applyNewControlPointShift(timeline, newControlPointShift);
      primary.dispatch((actions) => actions.setTimeline(newTimeline));

      const { pan = Vec2.ORIGIN } = ephemeral.state;

      view.dispatch((actions) =>
        actions.setFields({ viewBounds: shiftViewBoundsByX(view.state, pan.x) }),
      );

      params.submit({ name: "Create control points", allowSelectionShift: true });
    },
  });
}
