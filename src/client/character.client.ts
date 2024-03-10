import { Players } from "@rbxts/services";
import { CharacterRigR6 } from "types/characterRigR6";
import { testCharacter } from "./fighters";
import { Cleanup } from "shared/cleanup";
import { actionSignal } from "./signals";

const player = Players.LocalPlayer;
player.CharacterAppearanceLoaded.Connect((model) => {
	const character = model as CharacterRigR6;
	const fighter = testCharacter(character);
	const cleanup = Cleanup();

	character.Humanoid.Died.Once(() => {
		cleanup.empty();
	});

	cleanup.add(
		actionSignal.connect((action) => {
			if (action === "FastFall") {
				fighter.fastfall();
			} else if (action === "Airdash") {
				fighter.airdash();
			} else if (action === "Jump") {
				fighter.jump();
			}
		}),
	);
});
