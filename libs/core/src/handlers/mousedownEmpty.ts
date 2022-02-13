import { ActionOptions, SomeMouseEvent } from "timelime/types";
import { isKeyDown } from "~core/listener/keyboard";
import { mouseDownMoveAction } from "~core/state/mouseDownMoveAction";
import { createGlobalToNormalFnFromActionOptions } from "~core/utils/coords/globalToNormal";
import { isVecInRect, rectOfTwoVecs } from "~core/utils/math/math";
import { Vec2 } from "~core/utils/math/Vec2";

interface Options {
  e: SomeMouseEvent;
}

export function onMousedownEmpty(actionOptions: ActionOptions, options: Options) {
  // The user clicked empty space on the timeline.
  //
  // If the user clicks without dragging, clear the selection.
  //
  // If the user clicks and drags, create a selection rect and select all elements
  // within the rect.

  const { e } = options;

  const wasShiftDown = isKeyDown("Shift");

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,
    keys: [],
    beforeMove: () => {},
    mouseMove: (params, { mousePosition, initialMousePosition }) => {
      const dragSelectionRect = rectOfTwoVecs(initialMousePosition.normal, mousePosition.normal);
      params.ephemeral.dispatch((actions) => actions.setFields({ dragSelectionRect }));
    },
    mouseUp: (params) => {
      const { primary, selection, ephemeral } = params;

      const { dragSelectionRect } = ephemeral.state;
      const { timelines } = primary.state;

      const timelineList = Object.values(timelines);

      const clearSelection = () => {
        for (const timeline of timelineList) {
          selection.dispatch((actions) => actions.emptyIfExists(timeline.id));
        }
      };

      if (!dragSelectionRect) {
        clearSelection();
        params.submit({ name: "Clear selection" });
        return;
      }

      if (!wasShiftDown) {
        clearSelection();
      }

      for (const timeline of timelineList) {
        const keyframes = timeline.keyframes
          .filter((k) => isVecInRect(Vec2.new(k.index, k.value), dragSelectionRect))
          .map((k) => k.id);
        if (keyframes.length) {
          selection.dispatch((actions) => actions.addKeyframes(timeline.id, keyframes));
        }
      }
      params.submit({ name: "Select keyframes" });
    },
  });
}
