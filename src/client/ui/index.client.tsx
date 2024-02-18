import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { App } from "./app";
import { RemProvider } from "./remProvider";

const root = createRoot(new Instance("Folder"));

root.render(
  <StrictMode>
    {
      createPortal(
        <RemProvider>
          <App />
        </RemProvider>,
        Players.LocalPlayer.WaitForChild("PlayerGui"))
    }
  </StrictMode>
)