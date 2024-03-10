import React from "@rbxts/react"
import { useRem } from "./useRem";
import { actionSignal } from "client/signals";

/**
 * The properties for the `Button` component. Should mostly cover the important properties for normal buttons.
 *
 * @param size - A number that dictates the rem size for both dimensions.
 * @param offset - The offset from the bottom right corner of the screen.
 * @param imageId - Self explanatory.
 * @param color - The background color of the button.
 * @param pressedEvent - Self explanatory.
 */
type ButtonProps = {
  size?: number,
  offset?: Vector2,
  imageId?: string,
  color?: Color3,
  pressedEvent?: () => void
}

/**
 * A singular button for mobile controls.
 *
 * @param props - The properties for this component.
 */
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

/**
 * The actual mobile buttons.
 */
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