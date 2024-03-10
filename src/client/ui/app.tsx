import React, { PropsWithChildren } from "@rbxts/react"
import { MobileControls } from "./mobileControls";
import { useInputDevice } from "./useInputDevice";
import { ErrorBoundary } from "./errorBoundary";
import { useRem } from "./useRem";

/**
 * Props for the `Layer` component.
 *
 * @see https://github.com/littensy/slither/blob/main/src/client/components/ui/layer.tsx
 * @param displayOrder - The DisplayOrder property of the `ScreenGui`.
 */
type LayerProps = PropsWithChildren & {
  displayOrder?: number;
}

/**
 * A convenience component so that I don't have to set any `ScreenGui` properties manually.
 *
 * @see https://github.com/littensy/slither/blob/main/src/client/components/ui/layer.tsx
 * @param props - The properties for this component.
 * @returns The layer component.
 */
function Layer({ displayOrder, children }: LayerProps) {
  return (
    <screengui ResetOnSpawn={false} DisplayOrder={displayOrder} IgnoreGuiInset ZIndexBehavior="Sibling">
      {children}
    </screengui>
  )
}

/**
 * Props for the `ErrorPage` component.
 *
 * @param message - What is displayed in the error page.
 */
type ErrorPageProps = {
  readonly message: unknown;
}

/**
 * What is displayed if the UI ever breaks.
 *
 * @param props - The properties for this component.
 * @return The error page component.
 */
export function ErrorPage({ message }: ErrorPageProps) {
  const rem = useRem();

  return (
    <Layer>
    </Layer>
  )
}

/**
 * Unifies all components into one neat component.
 *
 * @returns An `ErrorBoundary` with all components inside.
 */
export function App() {
  return (
    <ErrorBoundary
      fallback={(message) => {
        return <ErrorPage message={message} />;
      }}
    >
      {
        useInputDevice() === "touch" &&
        <Layer key="mobile-controls">
          <MobileControls key="mobile-controls-ui" />
        </Layer>
      }
    </ErrorBoundary>
  )
}