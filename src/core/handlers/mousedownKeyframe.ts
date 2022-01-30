import { areMapsShallowEqual } from "map-fns";
import { getGraphEditorYBoundsFromActionOptions } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, SomeMouseEvent } from "~/types/commonTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

const getYUpperLower = (
  viewport: Rect,
  mousePositionGlobal: Vec2
): [yUpper: number, yLower: number] => {
  const { y } = mousePositionGlobal;
  const buffer = 15;
  const yUpper = Math.max(0, viewport.top - (y - buffer));
  const yLower = Math.max(0, y + buffer - (viewport.top + viewport.height));
  return [yUpper, yLower];
};

const getXUpperLower = (
  viewport: Rect,
  mousePositionGlobal: Vec2
): [xUpper: number, xLower: number] => {
  const { x } = mousePositionGlobal;
  const buffer = 15;
  const xUpper = Math.max(0, viewport.left - (x - buffer));
  const xLower = Math.max(0, x + buffer - (viewport.left + viewport.width));
  return [xUpper, xLower];
};

const PAN_FAC = 0.1;

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

  const yBounds = getGraphEditorYBoundsFromActionOptions(actionOptions);
  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const d0 = globalToNormal(Vec2.new(0, 0));
  const d1 = globalToNormal(Vec2.new(1, 1));
  const deltaFac = d0.sub(d1);

  let yPan = 0;
  let xPan = 0;

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    keys: ["Shift"],
    translate: globalToNormal,
    beforeMove: (params) => {
      const { selection, ephemeral } = params;

      const timelineSelection = selection.state[timelineId];

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
    tickShouldUpdate: (params, { mousePosition }) => {
      const { viewport } = params.view.state;
      const [yUpper, yLower] = getYUpperLower(viewport, mousePosition.global);
      const [xUpper, xLower] = getXUpperLower(viewport, mousePosition.global);
      return !!(yUpper || yLower || xUpper || xLower);
    },
    mouseMove: (
      params,
      { initialMousePosition, mousePosition, moveVector, keyDown }
    ) => {
      const { ephemeral, view } = params;
      const { viewport } = view.state;

      const [xUpper, xLower] = getXUpperLower(viewport, mousePosition.global);
      const [yUpper, yLower] = getYUpperLower(viewport, mousePosition.global);

      if (yLower) {
        yPan -= yLower * deltaFac.y * PAN_FAC;
      } else if (yUpper) {
        yPan += yUpper * deltaFac.y * PAN_FAC;
      }
      if (xLower) {
        xPan -= xLower * deltaFac.x * PAN_FAC;
      } else if (xUpper) {
        xPan += xUpper * deltaFac.x * PAN_FAC;
      }

      if (xLower || xUpper || yLower || yUpper) {
        const pan = Vec2.new(xPan, yPan);
        ephemeral.dispatch((actions) => actions.setFields({ pan }));
      }

      const panShiftedInitialGlobalMousePosition =
        initialMousePosition.global.subXY(
          -xPan / deltaFac.x,
          -yPan / deltaFac.y
        );
      const globalMoveVector = mousePosition.global.sub(
        panShiftedInitialGlobalMousePosition
      );

      let { x, y } = moveVector.normal;

      x += xPan;
      y += yPan;

      if (keyDown.Shift) {
        if (Math.abs(globalMoveVector.x) > Math.abs(globalMoveVector.y)) {
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
