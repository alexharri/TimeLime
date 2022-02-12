import { MOVE_ACTION_PAN_FAC } from "~/core/constants";
import { isKeyDown } from "~/core/listener/keyboard";
import { getGraphEditorYBoundsFromActionOptions } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { applyControlPointShift } from "~/core/timeline/applyControlPointShift";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { createNormalToViewportFnFromActionOptions } from "~/core/utils/coords/normalToViewport";
import { base64Cursors } from "~/core/utils/cursor/base64Cursors";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getViewportXUpperLower, getViewportYUpperLower } from "~/core/utils/viewportUtils";
import { shiftViewBoundsByX } from "~/core/utils/viewUtils";
import { SomeMouseEvent } from "~/types/commonTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

interface Options {
  e: SomeMouseEvent;
  timelineId: string;
  keyframe: TimelineKeyframe;
  which: "left" | "right";
}

export const onMousedownControlPoint = (actionOptions: ActionOptions, options: Options) => {
  const yBounds = getGraphEditorYBoundsFromActionOptions(actionOptions);
  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);
  const normalToViewport = createNormalToViewportFnFromActionOptions(actionOptions);

  // Viewport-to-Normal multiplier
  const normalFac = globalToNormal(Vec2.new(0, 0)).sub(globalToNormal(Vec2.new(1, 1)));

  // Normal-to-Viewport multiplier
  const reverseNormalFac = normalToViewport(Vec2.new(1, 1)).sub(normalToViewport(Vec2.new(0, 0)));

  // Proportion between Viewport X and Viewport Y
  const yFac = reverseNormalFac.x / reverseNormalFac.y;

  let xPan = 0;
  let yPan = 0;

  const { e, keyframe: k, timelineId, which } = options;

  const { timelines } = actionOptions.initialState.primary;
  const timeline = timelines[timelineId];
  const keyframeIndex = timeline.keyframes.findIndex((keyframe) => keyframe.id === k.id);
  const timelineList = Object.values(timelines);

  const altDownAtMouseDown = isKeyDown("Alt");

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    keys: ["Shift"],
    globalToNormal,
    beforeMove: (params) => {
      const { primary, selection, ephemeral } = params;

      // Add keyframe to selection if not part of current selection.
      //
      // If not part of current selection and shift key was not down, the current
      // timeline selection is cleared.
      const selected = selection.state[timelineId]?.keyframes[k.id];
      if (!selected) {
        timelineList.forEach((timeline) => {
          selection.dispatch((actions) => actions.emptyIfExists(timeline.id));
        });
        selection.dispatch((actions) => actions.toggleKeyframe(timelineId, k.id));
      }

      if (altDownAtMouseDown) {
        // If alt was down, toggle the reflection preference of all selected
        // keyframes in all active timelines.
        for (const timeline of timelineList) {
          const timelineSelection = selection.state[timeline.id];
          if (!timelineSelection) {
            continue;
          }

          for (const [i, keyframe] of timeline.keyframes.entries()) {
            if (!timelineSelection.keyframes[keyframe.id]) {
              continue;
            }
            const { reflectControlPoints } = keyframe;
            primary.dispatch((actions) =>
              actions.setKeyframeReflectControlPoints(timeline.id, i, !reflectControlPoints),
            );
          }
        }
      }

      const cursor = altDownAtMouseDown
        ? base64Cursors.convert_anchor
        : base64Cursors.selection_move;
      ephemeral.dispatch((actions) => actions.setFields({ yBounds, cursor }));
    },
    tickShouldUpdate: (params, { mousePosition }) => {
      const { viewport } = params.view.state;
      const [yUpper, yLower] = getViewportYUpperLower(viewport, mousePosition.global);
      const [xUpper, xLower] = getViewportXUpperLower(viewport, mousePosition.global);
      return !!(yUpper || yLower || xUpper || xLower);
    },
    mouseMove: (params, { moveVector, mousePosition, keyDown }) => {
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

      const distanceBetweenKeyframes =
        which === "left"
          ? timeline.keyframes[keyframeIndex].index - timeline.keyframes[keyframeIndex - 1].index
          : timeline.keyframes[keyframeIndex + 1].index - timeline.keyframes[keyframeIndex].index;

      const shiftKeyDown = keyDown.Shift;
      const shiftVector = Vec2.new(x, y);

      ephemeral.dispatch((actions) =>
        actions.setFields({
          controlPointShift: {
            distanceBetweenKeyframes,
            direction: which,
            shiftVector,
            yFac,
            shiftKeyDown,
          },
        }),
      );
    },
    mouseUp: (params, hasMoved) => {
      const { primary, selection, view, ephemeral } = params;

      const { pan = Vec2.ORIGIN, controlPointShift } = ephemeral.state;

      if (!hasMoved || !controlPointShift) {
        if (!altDownAtMouseDown) {
          params.cancel(); // No control point was moved
          return;
        }

        primary.dispatch((action) =>
          action.setKeyframeControlPoint(timeline.id, keyframeIndex, which, null),
        );
        params.submit({ name: "Remove control point" });
        return;
      }

      if (!controlPointShift) {
      }

      view.dispatch((actions) =>
        actions.setFields({ viewBounds: shiftViewBoundsByX(view.state, pan.x) }),
      );

      // Apply control point shift
      const { timelines } = primary.state;
      const timelineSelectionState = selection.state;

      timelineList.forEach((timeline) => {
        primary.dispatch((actions) =>
          actions.setTimeline(
            applyControlPointShift({
              controlPointShift,
              // Use the latest timeline, keyframe.reflectControlPoints may have changed
              timeline: timelines[timeline.id],
              timelineSelection: timelineSelectionState[timeline.id],
            }),
          ),
        );
      });

      params.submit({ name: "Move control point" });
    },
  });
};
