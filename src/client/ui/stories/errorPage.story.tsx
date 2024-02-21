import { hoarcekat } from "@rbxts/pretty-react-hooks";
import { RemProvider } from "../remProvider";
import React from "@rbxts/react";
import { ErrorPage } from "../app";

export = hoarcekat(() => {
  return (
    <RemProvider>
      <ErrorPage message={"we testing boysss"} />
    </RemProvider>
  )
})