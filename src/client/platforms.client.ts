import { CollectionService, Players, RunService } from "@rbxts/services";
import { Bin } from "shared/bin";
import { CharacterRigR6 } from "types/characterRigR6";

const player = Players.LocalPlayer;

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

	// TODO: fall through the platform when pressing down
	bin.add(
		RunService.Stepped.Connect(() => {
			jumpThroughParts.forEach((part) => {
				part.CanCollide = rootpart.Position.Y > part.Position.Y + 1;
			});
		}),
	);
});
