import { addListener, removeListener } from "~/core/listener/addListener";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import {
  EphemeralState,
  PerformActionOptions,
  PrimaryState,
  SelectionState,
  ViewState,
} from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { timelineActions } from "~/core/timelineActions";
import { timelineReducer } from "~/core/timelineReducer";
import { timelineSelectionActions } from "~/core/timelineSelectionActions";
import { timelineSelectionReducer } from "~/core/timelineSelectionReducer";
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

  let primaryState: PrimaryState = performOptions.primary;
  let selectionState: SelectionState = performOptions.selection;
  let viewState: ViewState = performOptions.view;
  let ephemeralState: EphemeralState = {};

  const timeline = primaryState.timelines[timelineId];

  selectionState = timelineSelectionReducer(
    selectionState,
    timelineSelectionActions.clear(timelineId)
  );
  selectionState = timelineSelectionReducer(
    selectionState,
    timelineSelectionActions.toggleKeyframe(timelineId, keyframe.id)
  );
  performOptions.onPrimaryStateChange(primaryState);

  const { timelines } = primaryState;
  const { length } = viewState;

  ephemeralState.yBounds = getGraphEditorYBounds({
    length,
    timelines,
    viewBounds: viewState.viewBounds,
  });

  const globalToNormal = createGlobalToNormalFn({
    length,
    viewport: viewState.viewport,
    viewBounds: viewState.viewBounds,
    timelines,
  });

  const initialMousePosition = Vec2.fromEvent(e).apply(globalToNormal);

  let keyframeShift: Vec2 | undefined;

  const render = () => {
    performOptions.render({
      primary: primaryState,
      selection: selectionState,
      view: viewState,
      ephemeral: ephemeralState,
    });
  };

  render();

  const moveToken = addListener.repeated("mousemove", (e) => {
    const mousePosition = Vec2.fromEvent(e).apply(globalToNormal);

    const moveVector = mousePosition.sub(initialMousePosition);

    keyframeShift = Vec2.new(Math.round(moveVector.x), moveVector.y);
    ephemeralState = { ...ephemeralState, keyframeShift };
    performOptions.onEphemeralStateChange(ephemeralState);

    render();
  });

  addListener.once("mouseup", () => {
    removeListener(moveToken);

    if (!keyframeShift) {
      performOptions.onCancel();
      return;
    }

    const nextTimeline = applyTimelineKeyframeShift({
      keyframeShift,
      timeline,
      timelineSelection: selectionState[timelineId],
    });

    primaryState = timelineReducer(
      primaryState,
      timelineActions.setTimeline(nextTimeline)
    );
    ephemeralState = {};

    performOptions.onEphemeralStateChange(ephemeralState);
    performOptions.onPrimaryStateChange(primaryState);
    performOptions.onSelectionStateChange(selectionState);
    performOptions.onViewStateChange(viewState);

    render();

    performOptions.onSubmit();
  });
}
