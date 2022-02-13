import { useContext } from "react";
import { ITimelineStateContext, TimelineStateContext } from "~react/TimelineStateContext";

export function useTimelineState(): ITimelineStateContext {
  const result = useContext(TimelineStateContext);

  if (!result) {
    console.warn(
      `The TimelineStateContext has not been initialized in this context.\n\n` +
        `Did you forget to provide the state via 'useTimelineStateProvider'?\n\n` +
        `\tconst { Provider } = useTimelineStateProvider({ /* ... */ });\n\n` +
        `\t<Provider>\n\t\t{children}\n\t</Provider>`,
    );
    throw new Error(`No TimelineStateContext has been provided in scope.`);
  }

  return result;
}
