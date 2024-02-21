import React, { PropsWithChildren } from "@rbxts/react"
import { MobileControls } from "./mobileControls";
import { useInputDevice } from "./useInputDevice";
import { ErrorBoundary } from "./errorBoundary";
import { useRem } from "./useRem";

// taken from https://github.com/littensy/slither/blob/main/src/client/components/ui/layer.tsx

interface LayerProps extends PropsWithChildren {
  displayOrder?: number;
}

function Layer({ displayOrder, children }: LayerProps) {
  return (
    <screengui ResetOnSpawn={false} DisplayOrder={displayOrder} IgnoreGuiInset ZIndexBehavior="Sibling">
      {children}
    </screengui>
  )
}

interface ErrorPageProps {
  readonly message: unknown;
}

export function ErrorPage({ message }: ErrorPageProps) {
  const rem = useRem();

  return (
    <Layer>
    </Layer>
  )
}

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
    </ErrorBoundary >
  )
}