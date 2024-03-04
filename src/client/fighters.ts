import { RunService, Workspace } from "@rbxts/services";
import { Cleanup } from "shared/cleanup";
import { playSound } from "shared/playSound";
import { CharacterRigR6 } from "types/characterRigR6";
import { FighterClient } from "types/fighter";

const groundedCheckDistance = 1;
const walljumpCheckDistance = 3;
const wavedashTimeWindow = 0.1;
const momentumTimeWindow = 0.2;

/**
 * A type definition for functions that take a character alongside some settings and return a FighterClient.
 *
 * @typeParam F - The type of the fighter that gets returned from the function.
 * @typeParam S - The settings for the fighter.
 */
type CharacterInitializer<F extends FighterClient, S extends {}> = (character: CharacterRigR6, settings: S) => F;

/**
 * The settings for the default movement system.
 *
 * @param fastFallSpeed - The downward velocity applied for fast falls.
 * @param jumpSpeed - The upward velocity applied for jumps.
 * @param airdashSpeed - The velocity applied for airdashes.
 * @param walljumpBounceSpeed - The velocity applied for walljumps.
 * @param wavedashSpeed - The velocity applied for wavedashes.
 * @param jumpAmount - The amount of jumps the character has.
 */
type MovementSettings = {
	fastFallSpeed: number;
	jumpSpeed: number;
	airdashSpeed: number;
	walljumpBounceSpeed: number;
	wavedashSpeed: number;
	jumpAmount: number;
};

/**
 * The default movement template for all other characters.
 * Intended to be extended.
 *
 * @param remainingJumps - The jumps left before the character can't.
 * @param dashed - Dictates if the player can dash.
 * @param fastfalled - Dictates if the player can fastfall.
 * @param canWavedash - Enabled when grounded at a certain timing window.
 * @param momentum - The velocity applied when the character jumps.
 * @param previousHeartbeatGrounded - Used because we only want to register if someone is grounded the moment they become grounded.
 */
type DefaultMovement = FighterClient & {
	remainingJumps: number;
	dashed: boolean;
	fastfalled: boolean;
	canWavedash: boolean;
	momentum: number;
	previousHeartbeatGrounded: boolean;
};

const defaultMovementSettings: MovementSettings = {
	fastFallSpeed: 50,
	jumpSpeed: 60,
	airdashSpeed: 50,
	walljumpBounceSpeed: 50,
	wavedashSpeed: 20,
	jumpAmount: 2,
};

const camera = Workspace.CurrentCamera as Camera;

/**
 * The function that returns the default movement for the characters.
 * Intended to be extended. DO NOT make this an independent character.
 */
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
				humanoid.MoveDirection.mul(-walljumpCheckDistance),
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
					humanoid.MoveDirection.mul(movementSettings.airdashSpeed * mass).add(
						Vector3.yAxis.mul(camera.CFrame.LookVector.Y * movementSettings.airdashSpeed * mass),
					),
				);

				defaultMovement.dashed = true;

				defaultMovement.canWavedash = true;
				task.wait(wavedashTimeWindow);
				defaultMovement.canWavedash = false;
			}
		},
	};

	cleanup.add(
		RunService.Heartbeat.Connect(() => {
			const groundCast = Workspace.Blockcast(
				rootpart.CFrame,
				new Vector3(2, 1, 1),
				Vector3.yAxis.mul(-3 - groundedCheckDistance),
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
					task.wait(momentumTimeWindow);
					defaultMovement.momentum = 0;
				}
			}

			defaultMovement.previousHeartbeatGrounded = grounded;
		}),
	);

	return defaultMovement;
};