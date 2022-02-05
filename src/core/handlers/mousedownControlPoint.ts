import { MOVE_ACTION_PAN_FAC } from "~/core/constants";
import { isKeyDown } from "~/core/listener/keyboard";
import { getGraphEditorYBoundsFromActionOptions } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getViewportXUpperLower, getViewportYUpperLower } from "~/core/utils/viewportUtils";
import { SomeMouseEvent } from "~/types/commonTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

interface Options {
  e: SomeMouseEvent;
  timelineId: string;
  keyframe: TimelineKeyframe;
  direction: "left" | "right";
}

export const onMousedownControlPoint = (actionOptions: ActionOptions, options: Options) => {
  const yBounds = getGraphEditorYBoundsFromActionOptions(actionOptions);
  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const d0 = globalToNormal(Vec2.new(0, 0));
  const d1 = globalToNormal(Vec2.new(1, 1));
  const normalFac = d0.sub(d1); // Global-to-Normal multiplier
  const d1subd0 = d1.sub(d0);

  const yFac = d1subd0.x / d1subd0.y; // Proportion between Global X and Global Y

  let xPan = 0;
  let yPan = 0;

  const { e, keyframe: k, timelineId, direction } = options;

  // Whether or not the angle of the other control point of the keyframe should
  // be reflected according the the control point being moved.
  const shouldReflect = k.reflectControlPoints;
  let reflect = isKeyDown("Alt") ? !shouldReflect : shouldReflect;

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
          const timeline = timelines[timelineIndex];
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

      // Set mousedown keyframe specifically because `options.reflect` may
      // Have been provided.
      params.primary.dispatch((actions) =>
        actions.setKeyframeReflectControlPoints(timelineId, keyframeIndex, reflect),
      );

      params.ephemeral.dispatch((actions) => actions.setFields({ yBounds }));
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

      let { x, y } = moveVector.normal;

      x += xPan;
      y += yPan;

      const indexDiff =
        direction === "left"
          ? timeline.keyframes[keyframeIndex].index - timeline.keyframes[keyframeIndex - 1].index
          : timeline.keyframes[keyframeIndex + 1].index - timeline.keyframes[keyframeIndex].index;

      const shiftDown = keyDown.Shift;
      const shiftVector = Vec2.new(x, y);

      params.ephemeral.dispatch((actions) =>
        actions.setFields({
          controlPointShift: { indexDiff, direction, shiftVector, yFac, shiftDown },
        }),
      );
    },
    mouseUp: (params, hasMoved) => {
      if (!hasMoved) {
        if (!altDownAtMouseDown) {
          params.cancel(); // No control point was moved
          return;
        }

        params.primary.dispatch((action) =>
          action.setKeyframeControlPoint(timeline.id, keyframeIndex, direction, null),
        );
        params.submit({ name: "Remove control point" });
        return;
      }

      // Apply control point shift
      // const timelineSelectionState = params.selection.state;

      // op.add(
      //   ...timelines.map(({ id }) =>
      //     timelineActions.applyControlPointShift(id, timelineSelectionState[id]),
      //   ),
      // );

      params.submit({ name: "Move control point" });
    },
  });
};
