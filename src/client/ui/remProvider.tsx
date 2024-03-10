import React, { PropsWithChildren, createContext, useEffect } from "@rbxts/react";
import { map, useCamera, useDebounceState, useEventListener } from "@rbxts/pretty-react-hooks";

/**
 * The properties for the `RemProvider` component.
 *
 * @see https://github.com/littensy/slither/blob/main/src/client/providers/rem-provider.tsx
 * @param baseRem - The default rem to operate with.
 * @param remOverride - The rem is set to this NO MATTER WHAT.
 * @param minimumRem - Doesn't get below this NO MATTER WHAT.
 * @param maximumRem - Doesn't get above this NO MATTER WHAT.
 */
export type RemProviderProps = PropsWithChildren & {
  baseRem?: number;
  remOverride?: number;
  minimumRem?: number;
  maximumRem?: number;
}

export const DEFAULT_REM = 16;
export const MIN_REM = 8;
const BASE_RESOLUTION = new Vector2(1920, 1020);
const MAX_ASPECT_RATIO = 19 / 9;

export const RemContext = createContext<number>(DEFAULT_REM);

/**
 * A provider component that updates the values for the `rem` function.
 *
 * @see https://github.com/littensy/slither/blob/main/src/client/providers/rem-provider.tsx
 */
export function RemProvider({
  baseRem = DEFAULT_REM,
  minimumRem = MIN_REM,
  maximumRem = math.huge,
  remOverride,
  children,
}: RemProviderProps) {
  const camera = useCamera();
  const [rem, setRem] = useDebounceState(baseRem, { wait: 0.2, leading: true });

  const update = () => {
    const viewport = camera.ViewportSize;

    if (remOverride !== undefined) {
      return remOverride;
    }

    // wide screens should not scale beyond iPhone aspect ratio
    const resolution = new Vector2(math.min(viewport.X, viewport.Y * MAX_ASPECT_RATIO), viewport.Y);
    const scale = resolution.Magnitude / BASE_RESOLUTION.Magnitude;
    const desktop = resolution.X > resolution.Y || scale >= 1;

    // portrait mode should downscale slower than landscape
    const factor = desktop ? scale : map(scale, 0, 1, 0.25, 1);

    setRem(math.clamp(math.round(baseRem * factor), minimumRem, maximumRem));
  };

  useEventListener(camera.GetPropertyChangedSignal("ViewportSize"), update);

  useEffect(() => {
    update();
  }, [baseRem, minimumRem, maximumRem, remOverride]);

  return <RemContext.Provider value={rem}>{children}</RemContext.Provider>;
}