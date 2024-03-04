import { UserInputService } from "@rbxts/services";
import { actionSignal } from "./signals";

/** The movement and attack actions that the fighter can do. Use `undefined` to specify that none are being used. */
export type FighterAction = "FastFall" | "Airdash" | "Jump" | "Attack" | "StrongAttack";

/** The direction that actions can use. Use `undefined` to specify that none are being used. */
type DirectionModifier = "Up" | "Down" | "Left" | "Right" | "Forward" | "Backward";

const actionBindings: Map<FighterAction, Enum.KeyCode> = new Map<FighterAction, Enum.KeyCode>([
	["FastFall", Enum.KeyCode.Q],
	["Airdash", Enum.KeyCode.F],
	["Jump", Enum.KeyCode.Space],
]);

const directionBindings: Map<DirectionModifier, Enum.KeyCode> = new Map<DirectionModifier, Enum.KeyCode>([
	["Forward", Enum.KeyCode.W],
	["Backward", Enum.KeyCode.S],
	["Left", Enum.KeyCode.A],
	["Right", Enum.KeyCode.D],
	["Up", Enum.KeyCode.E],
	["Down", Enum.KeyCode.R],
]);

// vertical direction bindings are prioritized
// god this code is so bad
export function getDirectionModifier(): DirectionModifier | undefined {
	// making these numbers because sometimes the values cancel out if you press them at the same time
	let xValue = 0; // left and right
	let yValue = 0; // up and down
	let zValue = 0; // forward and backward

	// OH GOD THIS IS *SO* BAD
	directionBindings.forEach((key, direction) => {
		if (UserInputService.IsKeyDown(key)) {
			xValue += direction === "Left" ? 1 : direction === "Right" ? -1 : 0;
			yValue += direction === "Up" ? 1 : direction === "Down" ? -1 : 0;
			zValue += direction === "Forward" ? 1 : direction === "Backward" ? -1 : 0;
		}
	});

	// IT SOMEHOW GOT WORSE
	const xDirection = xValue > 0 ? "Left" : xValue < 0 ? "Right" : undefined;
	const yDirection = yValue > 0 ? "Up" : yValue < 0 ? "Down" : undefined;
	const zDirection = zValue > 0 ? "Forward" : zValue < 0 ? "Backward" : undefined;

	// JESUS CHRIST GOD IT HURTS TO SEE
	return yDirection || zDirection || xDirection || undefined;
}

// TODO: add custom run/walk function so that wasd is rebindable

UserInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) {
		return;
	}

	let actionFound = false;

	actionBindings.forEach((keycode, action) => {
		if (input.KeyCode !== keycode) {
			return;
		}

		actionSignal.fire(action);
		actionFound = true;
	});

	if (!actionFound) {
		actionSignal.fire(undefined);
	}
});

UserInputService.InputEnded.Connect(() => {
	actionSignal.fire(undefined);
});
