import { areMapsShallowEqual } from "map-fns";
import { MOVE_ACTION_PAN_FAC } from "~/core/constants";
import { getGraphEditorYBoundsFromActionOptions } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
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
}

export function onMousedownKeyframe(actionOptions: ActionOptions, options: Options) {
  const { e, timelineId, keyframe } = options;

  const additiveSelection = e.shiftKey;

  const yBounds = getGraphEditorYBoundsFromActionOptions(actionOptions);
  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  // Global-to-Normal multiplier
  const normalFac = globalToNormal(Vec2.new(0, 0)).sub(globalToNormal(Vec2.new(1, 1)));

  let yPan = 0;
  let xPan = 0;

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    keys: ["Shift"],
    globalToNormal,
    beforeMove: (params) => {
      const { primary, selection, ephemeral } = params;

      const timelineSelection = selection.state[timelineId];

      const cursor = base64Cursors.selection_move;
      ephemeral.dispatch((actions) => actions.setFields({ yBounds, cursor }));

      if (additiveSelection) {
        selection.dispatch((actions) => actions.toggleKeyframe(timelineId, keyframe.id));
      } else if (!timelineSelection?.keyframes[keyframe.id]) {
        for (const timelineId of Object.keys(primary.state.timelines)) {
          selection.dispatch((actions) => actions.clear(timelineId));
        }
        selection.dispatch((actions) => actions.toggleKeyframe(timelineId, keyframe.id));
      }
    },
    tickShouldUpdate: (params, { mousePosition }) => {
      const { viewport } = params.view.state;
      const [yUpper, yLower] = getViewportYUpperLower(viewport, mousePosition.global);
      const [xUpper, xLower] = getViewportXUpperLower(viewport, mousePosition.global);
      return !!(yUpper || yLower || xUpper || xLower);
    },
    mouseMove: (params, { initialMousePosition, mousePosition, moveVector, keyDown }) => {
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

      const panShiftedInitialGlobalMousePosition = initialMousePosition.global.subXY(
        -xPan / normalFac.x,
        -yPan / normalFac.y,
      );
      const globalMoveVector = mousePosition.global.sub(panShiftedInitialGlobalMousePosition);

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

      const keyframeShift = Vec2.new(x, y);
      ephemeral.dispatch((actions) => actions.setFields({ keyframeShift }));
    },
    mouseUp: (params) => {
      const { ephemeral, primary, selection, view } = params;
      const { keyframeShift } = ephemeral.state;

      if (!keyframeShift) {
        // The mouse did not move. The selection may have been modified.
        params.submit({
          name: "Modify selection",
          shouldAddToStack: (prev, next) => !areMapsShallowEqual(prev.selection, next.selection),
        });
        return;
      }

      const { timelines } = primary.state;

      for (const timeline of Object.values(timelines)) {
        const timelineSelection = selection.state[timeline.id];

        primary.dispatch((actions) =>
          actions.setTimeline(
            applyTimelineKeyframeShift({ keyframeShift, timeline, timelineSelection }),
          ),
        );
      }

      const { pan = Vec2.ORIGIN } = ephemeral.state;

      view.dispatch((actions) =>
        actions.setFields({ viewBounds: shiftViewBoundsByX(view.state, pan.x) }),
      );

      params.submit({ name: "Move keyframe", allowSelectionShift: true });
    },
  });
}
