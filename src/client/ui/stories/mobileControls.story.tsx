import { hoarcekat } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { RemProvider } from "../remProvider";
import { MobileControls } from "../mobileControls";

export = hoarcekat(() => {
  return (
    <RemProvider>
      <MobileControls />
    </RemProvider>
  )
})