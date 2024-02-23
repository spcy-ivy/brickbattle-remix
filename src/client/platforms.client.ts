import { CollectionService, Players, RunService } from "@rbxts/services";
import { CharacterRigR6 } from "types/characterRigR6";
import { actionSignal } from "./signals";
import { Cleanup } from "shared/cleanup";
import { MovementAction } from "./movement.client";

const renderStepName = "Platforms";

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

	const cleanup = Cleanup();

	humanoid.Died.Connect(() => {
		cleanup.empty();
	});

	RunService.BindToRenderStep(renderStepName, Enum.RenderPriority.First.Value, () => {
		jumpThroughParts.forEach((part) => {
			part.CanCollide = currentAction === "FastFall" ? false : rootpart.Position.Y > part.Position.Y + 1;
		});
	});

	cleanup.add(() => {
		RunService.UnbindFromRenderStep(renderStepName);
	});
});
