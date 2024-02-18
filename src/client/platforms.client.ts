import { CollectionService, Players, RunService } from "@rbxts/services";
import { CharacterRigR6 } from "types/characterRigR6";

const player = Players.LocalPlayer;
const character = (player.Character || player.CharacterAdded.Wait()[0]) as CharacterRigR6;

const jumpThroughParts = CollectionService.GetTagged("jump_through").reduce((accumulator, instance) => {
	if (!instance.IsA("BasePart")) {
		warn(`${instance.GetFullName()} was tagged with "jump_through" but it is not a BasePart!`);
		return accumulator;
	}

	return [...accumulator, instance];
}, [] as BasePart[]);

// TODO: fall through the platform when pressing down
RunService.Stepped.Connect(() => {
	jumpThroughParts.forEach((part) => {
		part.CanCollide = character.HumanoidRootPart.Position.Y > part.Position.Y + 1;
	});
});
