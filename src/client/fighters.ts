import { RunService, Workspace } from "@rbxts/services";
import { Cleanup } from "shared/cleanup";
import { playSound } from "shared/playSound";
import { CharacterRigR6 } from "types/characterRigR6";
import { FighterClient } from "types/fighter";

type CharacterInitializer<F extends FighterClient, S extends {}> = (character: CharacterRigR6, settings: S) => F;

type MovementSettings = {
	fastFallSpeed: number;
	jumpSpeed: number;
	dashSpeed: number;
	walljumpBounceSpeed: number;
	wavedashSpeed: number;
	jumpAmount: number;

	groundedCheckDistance: number;
	walljumpCheckDistance: number;
	wavedashTimeWindow: number;
	momentumTimeWindow: number;
};

type DefaultMovement = FighterClient & {
	remainingJumps: number;
	dashed: boolean;
	fastfalled: boolean;
	canWavedash: boolean;
	momentum: number;

	// have this set becuase it checks like every heartbeat and jumping takes time lmao
	previousHeartbeatGrounded: boolean;
};

const defaultMovementSettings: MovementSettings = {
	fastFallSpeed: 50,
	jumpSpeed: 60,
	dashSpeed: 50,
	walljumpBounceSpeed: 50,
	wavedashSpeed: 20,
	jumpAmount: 2,

	groundedCheckDistance: 1,
	walljumpCheckDistance: 3,
	wavedashTimeWindow: 0.1,
	momentumTimeWindow: 0.2,
};

const camera = Workspace.CurrentCamera as Camera;

export const defaultMovement: CharacterInitializer<DefaultMovement, MovementSettings> = (
	character,
	movementSettings = defaultMovementSettings,
) => {
	const cleanup = Cleanup();

	const characterCastParams = new RaycastParams();
	characterCastParams.FilterType = Enum.RaycastFilterType.Exclude;
	characterCastParams.FilterDescendantsInstances = [character];

	const rootpart = character.HumanoidRootPart;
	const humanoid = character.Humanoid;
	const mass = character
		.GetChildren()
		.filter((part): part is BasePart => part.IsA("BasePart"))
		.reduce((total, part) => total + part.Mass, 0);

	humanoid.WalkSpeed = 32;
	humanoid.JumpPower = 0;

	humanoid.Died.Connect(() => {
		cleanup.empty();
	});

	const defaultMovement = {
		remainingJumps: movementSettings.jumpAmount,
		dashed: false,
		fastfalled: false,
		canWavedash: false,
		momentum: 0,

		// have this set becuase it checks like every heartbeat and jumping takes time lmao
		previousHeartbeatGrounded: false,

		jump: () => {
			if (defaultMovement.remainingJumps < 1) {
				return;
			}

			const walljumpRay = Workspace.Raycast(
				rootpart.Position,
				humanoid.MoveDirection.mul(-movementSettings.walljumpCheckDistance),
				characterCastParams,
			);

			rootpart.AssemblyLinearVelocity = rootpart.AssemblyLinearVelocity.mul(Vector3.yAxis.mul(0));

			if (walljumpRay) {
				const sound = playSound("rbxassetid://142245269");
				sound.TimePosition = 0.1;

				rootpart.ApplyImpulse(
					walljumpRay.Normal.mul(mass * movementSettings.walljumpBounceSpeed).add(
						Vector3.yAxis.mul(mass * movementSettings.jumpSpeed),
					),
				);
				return;
			}

			rootpart.ApplyImpulse(
				Vector3.yAxis
					.mul(mass * movementSettings.jumpSpeed)
					.add(humanoid.MoveDirection.mul(mass * defaultMovement.momentum)),
			);
			defaultMovement.remainingJumps--;
		},

		fastfall: () => {
			if (!defaultMovement.fastfalled) {
				rootpart.AssemblyLinearVelocity = rootpart.AssemblyLinearVelocity.mul(Vector3.yAxis.mul(0));
				rootpart.ApplyImpulse(Vector3.yAxis.mul(-mass * movementSettings.fastFallSpeed));
				defaultMovement.fastfalled = true;
			}
		},

		airdash: () => {
			if (!defaultMovement.dashed) {
				rootpart.ApplyImpulse(
					humanoid.MoveDirection.mul(movementSettings.dashSpeed * mass).add(
						Vector3.yAxis.mul(camera.CFrame.LookVector.Y * movementSettings.dashSpeed * mass),
					),
				);

				defaultMovement.dashed = true;

				defaultMovement.canWavedash = true;
				task.wait(movementSettings.wavedashTimeWindow);
				defaultMovement.canWavedash = false;
			}
		},
	};

	cleanup.add(
		RunService.Heartbeat.Connect(() => {
			const groundCast = Workspace.Blockcast(
				rootpart.CFrame,
				new Vector3(2, 1, 1),
				Vector3.yAxis.mul(-3 - movementSettings.groundedCheckDistance),
				characterCastParams,
			);

			const grounded = groundCast !== undefined;

			if (grounded && !defaultMovement.previousHeartbeatGrounded) {
				defaultMovement.remainingJumps = movementSettings.jumpAmount;
				defaultMovement.dashed = false;
				defaultMovement.fastfalled = false;

				if (defaultMovement.canWavedash) {
					rootpart.ApplyImpulse(humanoid.MoveDirection.mul(mass * movementSettings.wavedashSpeed));
					defaultMovement.momentum = 75;
					task.wait(movementSettings.momentumTimeWindow);
					defaultMovement.momentum = 0;
				}
			}

			defaultMovement.previousHeartbeatGrounded = grounded;
		}),
	);

	return defaultMovement;
};
