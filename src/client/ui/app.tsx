import React from "@rbxts/react"
import { MobileControls } from "./mobileControls";
import { useInputDevice } from "./useInputDevice";

// taken from https://github.com/littensy/slither/blob/main/src/client/components/ui/layer.tsx

interface LayerProps extends React.PropsWithChildren {
  displayOrder?: number;
}

function Layer({ displayOrder, children }: LayerProps) {
  return (
    <screengui ResetOnSpawn={false} DisplayOrder={displayOrder} IgnoreGuiInset ZIndexBehavior="Sibling">
      {children}
    </screengui>
  )
}

export function App() {
  return (
    <>
      {
        useInputDevice() === "touch" &&
        <Layer key="mobile-controls">
          <MobileControls key="mobile-controls-ui" />
        </Layer>
      }
    </>
  )
}