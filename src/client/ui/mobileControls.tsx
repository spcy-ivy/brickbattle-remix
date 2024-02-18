import React from "@rbxts/react"
import { useRem } from "./useRem";

interface ButtonProps {
  size?: number,
  offset?: Vector2,
  imageId?: string
  color?: Color3
}

export function Button({ size = 10, offset = Vector2.one, imageId = "rbxassetid://7220505716", color = Color3.fromHex("#FFFFFF") }: ButtonProps) {
  const rem = useRem();

  return (
    <imagebutton
      Position={new UDim2(1, rem(-size - offset.X), 1, rem(-size - offset.Y))}
      Size={UDim2.fromOffset(rem(size), rem(size))}
      Image={imageId}
      BackgroundColor3={color}
    >
      <uicorner CornerRadius={new UDim(1)} />
    </imagebutton>
  )
}

export function MobileControls() {
  return (
    <>
      <Button key="primary-button" />
      <Button key="secondary-button" size={6} offset={new Vector2(3, 12)} />
      <Button key="tertiary-button" size={6} offset={new Vector2(10, 9)} />
    </>
  )
}