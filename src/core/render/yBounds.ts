import { splitTimelinePath } from "~/core/utils/math/splitTimelinePath";
import { Curve, ViewBounds, YBounds } from "~/types/commonTypes";
import { Timeline } from "~/types/timelineTypes";

interface Options {
  viewBounds: ViewBounds;
  length: number;
  timelines: Timeline[];
  timelineCurves: Curve[][];
}

export const getGraphEditorYBoundsFromPaths = (options: Options): YBounds => {
  const {
    viewBounds,
    length,
    timelines,
    timelineCurves: timelinePaths,
  } = options;

  const timelineYBounds = timelines.map((timeline, i): [number, number] => {
    if (timeline.keyframes.length === 1) {
      const { value } = timelines[0].keyframes[0];
      return [value, value];
    }

    let paths = timelinePaths[i];
    const originalPaths = [...paths];

    const iStart = viewBounds[0] * (length - 1);
    const iEnd = viewBounds[1] * (length - 1);

    // Remove all paths before and after the viewbounds end
    paths = paths.filter((path) => {
      if (path[path.length - 1].x < iStart || path[0].x > iEnd) {
        return false;
      }
      return true;
    });

    const controlPointYsToConsider: number[] = [];

    // Split paths that intersect the viewbounds
    if (paths.length > 0) {
      const pathAtStart = paths[0];

      if (pathAtStart[0].x < iStart) {
        const [, newPathAtStart] = splitTimelinePath(pathAtStart, iStart);
        paths[0] = newPathAtStart;

        if (pathAtStart.length === 4) {
          for (let j = 1; j < 3; j += 1) {
            if (pathAtStart[j].x > iStart) {
              controlPointYsToConsider.push(pathAtStart[j].y);
            }
          }
        }
      }

      const pathAtEnd = paths[paths.length - 1];

      if (pathAtEnd[pathAtEnd.length - 1].x > iEnd) {
        const [newPathAtEnd] = splitTimelinePath(pathAtEnd, iEnd);
        paths[paths.length - 1] = newPathAtEnd;

        if (pathAtEnd.length === 4) {
          for (let j = 1; j < 3; j += 1) {
            if (pathAtEnd[j].x < iEnd) {
              controlPointYsToConsider.push(pathAtEnd[j].y);
            }
          }
        }
      }
    } else {
      const startIndex = originalPaths[0][0].x;
      const lastPath = originalPaths[originalPaths.length - 1];
      const y =
        startIndex > iStart
          ? originalPaths[0][0].y
          : lastPath[lastPath.length - 1].y;
      return [y, y];
    }

    if (paths.length) {
      let yUpper = -Infinity;
      let yLower = Infinity;

      for (let i = 0; i < paths.length; i += 1) {
        for (let j = 0; j < paths[i].length; j += 1) {
          const vec = paths[i][j];
          if (yUpper < vec.y) {
            yUpper = vec.y;
          }
          if (yLower > vec.y) {
            yLower = vec.y;
          }
        }
      }

      for (let i = 0; i < controlPointYsToConsider.length; i += 1) {
        const value = controlPointYsToConsider[i];
        if (yUpper < value) {
          yUpper = value;
        }
        if (yLower > value) {
          yLower = value;
        }
      }

      return [yUpper, yLower];
    } else {
      const value =
        iEnd < timeline.keyframes[0].index
          ? timeline.keyframes[0].value
          : timeline.keyframes[timeline.keyframes.length - 1].value;

      return [value, value];
    }
  });

  const yUpper = Math.max(...timelineYBounds.map(([value]) => value));
  const yLower = Math.min(...timelineYBounds.map(([, value]) => value));

  const diff = yUpper - yLower;

  if (diff === 0) {
    return [yUpper + 10, yUpper - 10];
  }

  // Add .1 of the diff on each side for padding.
  return [yUpper + diff * 0.1, yLower - diff * 0.1];
};
