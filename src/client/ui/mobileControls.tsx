import React from "@rbxts/react"
import { useRem } from "./useRem";
import { actionSignal } from "client/signals";

interface ButtonProps {
  size?: number,
  offset?: Vector2,
  imageId?: string,
  color?: Color3,
  pressedEvent?: () => void
}

export function Button({
  size = 10,
  offset = Vector2.one,
  imageId = "rbxassetid://7220505716",
  color = Color3.fromHex("#FFFFFF"),
  pressedEvent = () => {
    print("you didnt bind this to anything yet...")
  }
}: ButtonProps) {
  const rem = useRem();

  return (
    <imagebutton
      Position={new UDim2(1, rem(-size - offset.X), 1, rem(-size - offset.Y))}
      Size={UDim2.fromOffset(rem(size), rem(size))}
      Image={imageId}
      BackgroundColor3={color}
      Event={{
        MouseButton1Click: pressedEvent
      }}
    >
      <uicorner CornerRadius={new UDim(1)} />
    </imagebutton>
  )
}

export function MobileControls() {
  return (
    <>
      <Button
        key="jump-button"
        pressedEvent={() => { actionSignal.fire("Jump") }}
      />

      <Button
        key="airdash-button"
        size={6}
        offset={new Vector2(3, 12)}
        pressedEvent={() => { actionSignal.fire("Airdash") }}
      />

      <Button
        key="fastfall-button"
        size={6}
        offset={new Vector2(10, 9)}
        pressedEvent={() => { actionSignal.fire("FastFall") }}
      />
    </>
  )
}