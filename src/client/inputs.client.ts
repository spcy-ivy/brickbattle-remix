import { UserInputService } from "@rbxts/services";
import { actionSignal } from "./movement.client";

type Action = "FastFall" | "Airdash" | "Jump";

const bindings: Map<Action, Enum.KeyCode> = new Map<Action, Enum.KeyCode>([
	["FastFall", Enum.KeyCode.Q],
	["Airdash", Enum.KeyCode.F],
	["Jump", Enum.KeyCode.Space],
]);

UserInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) {
		return;
	}

	bindings.forEach((keycode, action) => {
		if (input.KeyCode !== keycode) {
			return;
		}

		actionSignal.fire(action);
	});
});

