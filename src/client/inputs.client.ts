import { UserInputService } from "@rbxts/services";
import { MovementAction } from "./movement.client";
import { actionSignal } from "./signals";

const bindings: Map<MovementAction, Enum.KeyCode> = new Map<MovementAction, Enum.KeyCode>([
	["FastFall", Enum.KeyCode.Q],
	["Airdash", Enum.KeyCode.F],
	["Jump", Enum.KeyCode.Space],
]);

UserInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) {
		return;
	}

	let actionFound = false;

	bindings.forEach((keycode, action) => {
		if (input.KeyCode !== keycode) {
			return;
		}

		actionSignal.fire(action);
		actionFound = true;
	});

	if (!actionFound) {
		actionSignal.fire("None");
	}
});

UserInputService.InputEnded.Connect(() => {
	actionSignal.fire("None");
});
