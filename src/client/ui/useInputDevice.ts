// taken from https://github.com/littensy/slither/blob/6540d0fa974c2bc8945a3969968b9a4d267388a6/src/client/hooks/use-input-device.ts

import { useEventListener } from "@rbxts/pretty-react-hooks";
import { useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";

export type InputDevice = "keyboard" | "gamepad" | "touch";

const getInputType = (inputType = UserInputService.GetLastInputType()): InputDevice | undefined => {
	if (inputType === Enum.UserInputType.Keyboard || inputType === Enum.UserInputType.MouseMovement) {
		return "keyboard";
	} else if (inputType === Enum.UserInputType.Gamepad1) {
		return "gamepad";
	} else if (inputType === Enum.UserInputType.Touch) {
		return "touch";
	}
};

export function useInputDevice() {
	const [device, setDevice] = useState<InputDevice>(() => {
		return getInputType() ?? "keyboard";
	});

	useEventListener(UserInputService.LastInputTypeChanged, (inputType) => {
		const newDevice = getInputType(inputType);

		if (newDevice !== undefined) {
			setDevice(newDevice);
		}
	});

	return device;
}
