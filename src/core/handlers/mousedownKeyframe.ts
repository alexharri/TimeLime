import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { SomeMouseEvent, ViewBounds } from "~/types/commonTypes";
import { TimelineKeyframe, TimelineMap } from "~/types/timelineTypes";

interface Options {
  e: SomeMouseEvent;
  timelines: TimelineMap;
  timelineId: string;
  keyframe: TimelineKeyframe;
  length: number;
  viewBounds: ViewBounds;
}

export function onMousedownKeyframe(options: Options) {
  const { e, timelines, timelineId, viewBounds } = options;

  const yBounds = getGraphEditorYBounds({ timelines, length, viewBounds });
  console.log({ yBounds, timelineId, e });

  // const selection = getTimelineSelection(timelineId);
  // const additiveSelection = e.shiftKey || e.metaKey;

  // const boundsDiff = Math.abs(yBounds[0] - yBounds[1]);
  // let yPan = 0;

  // mouseDownMoveAction(ctx.mousePosition.global, {
  //   keys: ["Shift"],
  //   translate: (vec) => ctx.globalToNormal(vec).addY(yPan),
  //   beforeMove: (params) => {
  //     if (additiveSelection) {
  //       params.dispatch(
  //         timelineSelectionActions.toggleKeyframe(timeline.id, keyframe.id)
  //       );
  //     } else if (!selection.keyframes[keyframe.id]) {
  //       // If the current node is not selected, we clear the selections of all timelines
  //       // we are operating on.
  //       params.dispatch(
  //         timelines.map(({ id }) => timelineSelectionActions.clear(id))
  //       );
  //       params.dispatch(
  //         timelineSelectionActions.toggleKeyframe(timeline.id, keyframe.id)
  //       );
  //     }
  //   },
  //   tickShouldUpdate: ({ mousePosition }) => {
  //     const [yUpper, yLower] = getYUpperLower(
  //       ctx.viewport,
  //       mousePosition.global
  //     );
  //     return !!(yUpper || yLower);
  //   },
  //   mouseMove: (
  //     params,
  //     { moveVector: _moveVector, mousePosition, keyDown, firstMove }
  //   ) => {
  //     if (firstMove) {
  //       params.dispatch(
  //         timelines.map((t) => timelineActions.setYBounds(t.id, yBounds))
  //       );
  //       params.dispatch(timelines.map((t) => timelineActions.setYPan(t.id, 0)));
  //     }

  //     const [yUpper, yLower] = getYUpperLower(
  //       ctx.viewport,
  //       mousePosition.global
  //     );

  //     if (yLower) {
  //       yPan -= yLower * boundsDiff * PAN_FAC;
  //     } else if (yUpper) {
  //       yPan += yUpper * boundsDiff * PAN_FAC;
  //     }

  //     if (yLower || yUpper) {
  //       params.dispatch(
  //         timelines.map((t) => timelineActions.setYPan(t.id, yPan))
  //       );
  //     }

  //     const moveVector = _moveVector.normal.copy();

  //     if (keyDown.Shift) {
  //       if (Math.abs(moveVector.x * yFac) > Math.abs(moveVector.y)) {
  //         moveVector.y = 0;
  //       } else {
  //         moveVector.x = 0;
  //       }
  //     }

  //     params.dispatch(
  //       timelines.map((t) =>
  //         timelineActions.setIndexAndValueShift(
  //           t.id,
  //           Math.round(moveVector.x),
  //           moveVector.y
  //         )
  //       )
  //     );
  //   },
  //   mouseUp: (params, hasMoved) => {
  //     if (!hasMoved) {
  //       params.submitAction("Select keyframe");
  //       return;
  //     }

  //     const toDispatch: any[] = [];

  //     for (const { id } of timelines) {
  //       toDispatch.push(
  //         timelineActions.setYBounds(id, null),
  //         timelineActions.setYPan(id, 0),
  //         timelineActions.submitIndexAndValueShift(id, getTimelineSelection(id))
  //       );
  //     }

  //     params.dispatch(toDispatch);
  //     params.submitAction("Move selected keyframes", { allowIndexShift: true });
  //   },
  // });
}
