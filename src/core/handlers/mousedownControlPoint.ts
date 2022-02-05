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

  const d0 = globalToNormal(Vec2.new(0, 0));
  const d1 = globalToNormal(Vec2.new(1, 1));
  const normalFac = d0.sub(d1); // Viewport-to-Normal multiplier

  const n0 = normalToViewport(Vec2.new(0, 0));
  const n1 = normalToViewport(Vec2.new(1, 1));
  const reverseNormalFac = n1.sub(n0); // Normal-to-Viewport multiplier

  const yFac = reverseNormalFac.x / reverseNormalFac.y; // Proportion between Viewport X and Viewport Y

  let xPan = 0;
  let yPan = 0;

  const { e, keyframe: k, timelineId, which } = options;

  const timelineSelectionState = actionOptions.initialState.selection;
  const { timelines } = actionOptions.initialState.primary;
  const timeline = timelines[timelineId];
  const keyframeIndex = timeline.keyframes.findIndex((keyframe) => keyframe.id === k.id);
  const timelineList = Object.values(timelines);

  const timelineSelectedKeyframes = timelineList.map<
    Array<{ index: number; keyframe: TimelineKeyframe }>
  >((timeline) => {
    const selection = timelineSelectionState[timeline.id];

    if (!selection) {
      return [];
    }

    return timeline.keyframes
      .map((keyframe, index) => ({ keyframe, index }))
      .filter((item) => selection.keyframes[item.keyframe.id]);
  });

  const altDownAtMouseDown = isKeyDown("Alt");

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    keys: ["Shift"],
    globalToNormal,
    beforeMove: (params) => {
      // Add keyframe to selection if not part of current selection.
      //
      // If not part of current selection and shift key was not down, the current
      // timeline selection is cleared.
      const selected = timelineSelectionState[timelineId]?.keyframes[k.id];
      if (!selected) {
        if (!isKeyDown("Shift")) {
          timelineList.forEach((timeline) => {
            params.selection.dispatch((actions) => actions.clear(timeline.id));
          });
        }
        params.selection.dispatch((actions) => actions.toggleKeyframe(timelineId, k.id));
      }

      if (altDownAtMouseDown) {
        // If alt was down, toggle the reflection preferences of all selected
        // keyframes in all active timelines.
        timelineSelectedKeyframes.forEach((ids, timelineIndex) => {
          const timeline = timelineList[timelineIndex];
          ids.forEach(({ keyframe, index }) => {
            params.primary.dispatch((actions) =>
              actions.setKeyframeReflectControlPoints(
                timeline.id,
                index,
                !keyframe.reflectControlPoints,
              ),
            );
          });
        });
      }

      const cursor = altDownAtMouseDown
        ? base64Cursors.convert_anchor
        : base64Cursors.selection_move;
      params.ephemeral.dispatch((actions) => actions.setFields({ yBounds, cursor }));
    },
    tickShouldUpdate: (params, { mousePosition }) => {
      const { viewport } = params.view.state;
      const [yUpper, yLower] = getViewportYUpperLower(viewport, mousePosition.global);
      const [xUpper, xLower] = getViewportXUpperLower(viewport, mousePosition.global);
      return !!(yUpper || yLower || xUpper || xLower);
    },
    mouseMove: (params, { moveVector, mousePosition, keyDown }) => {
      const { viewport } = params.view.state;

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
        params.ephemeral.dispatch((actions) => actions.setFields({ pan }));
      }

      let { x, y } = moveVector.normal;

      x += xPan;
      y += yPan;

      const indexDiff =
        which === "left"
          ? timeline.keyframes[keyframeIndex].index - timeline.keyframes[keyframeIndex - 1].index
          : timeline.keyframes[keyframeIndex + 1].index - timeline.keyframes[keyframeIndex].index;

      const shiftDown = keyDown.Shift;
      const shiftVector = Vec2.new(x, y);

      params.ephemeral.dispatch((actions) =>
        actions.setFields({
          controlPointShift: { indexDiff, direction: which, shiftVector, yFac, shiftDown },
        }),
      );
    },
    mouseUp: (params, hasMoved) => {
      const { view, ephemeral } = params;

      const { pan = Vec2.ORIGIN, controlPointShift } = ephemeral.state;

      if (!hasMoved || !controlPointShift) {
        if (!altDownAtMouseDown) {
          params.cancel(); // No control point was moved
          return;
        }

        params.primary.dispatch((action) =>
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
      const { timelines } = params.primary.state;
      const timelineSelectionState = params.selection.state;

      timelineList.forEach((timeline) => {
        params.primary.dispatch((actions) =>
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