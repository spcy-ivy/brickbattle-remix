import { CollectionService, Players, RunService } from "@rbxts/services";
import { Bin } from "shared/bin";
import { CharacterRigR6 } from "types/characterRigR6";
import { MovementAction } from "./movement.client";
import { actionSignal } from "./signals";

const player = Players.LocalPlayer;
let currentAction: MovementAction = "None";

// yeah i know stupid code what are you gonna do about it tho
actionSignal.connect((action) => {
	currentAction = action;
});

const jumpThroughParts = CollectionService.GetTagged("jump_through").reduce((accumulator, instance) => {
	if (!instance.IsA("BasePart")) {
		warn(`${instance.GetFullName()} was tagged with "jump_through" but it is not a BasePart!`);
		return accumulator;
	}

	return [...accumulator, instance];
}, [] as BasePart[]);

player.CharacterAppearanceLoaded.Connect((model) => {
	const character = model as CharacterRigR6;
	const rootpart = character.HumanoidRootPart;
	const humanoid = character.Humanoid;

	const bin = Bin();

	humanoid.Died.Connect(() => {
		bin.empty();
	});

	bin.add(
		RunService.Stepped.Connect(() => {
			jumpThroughParts.forEach((part) => {
				print(currentAction);

				if (currentAction === "FastFall") {
					part.CanCollide = false;
				} else {
					part.CanCollide = rootpart.Position.Y > part.Position.Y + 1;
				}
			});
		}),
	);
});
