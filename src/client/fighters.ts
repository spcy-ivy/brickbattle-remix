import { RunService, Workspace } from "@rbxts/services";
import {
	CharacterSettings,
	MovementSettings,
	defaultMovementSettings,
	testCharacterSettings,
} from "shared/characterSettings";
import { Cleanup } from "shared/cleanup";
import { playSound } from "shared/playSound";
import { CharacterRigR6 } from "types/characterRigR6";
import { FighterClient } from "types/fighter";

const groundedCheckDistance = 1;
const walljumpCheckDistance = 3;
const wavedashTimeWindow = 0.1;

/**
 * A type definition for functions that take a character alongside some settings and return a FighterClient.
 *
 * @typeParam F - The type of the fighter that gets returned from the function.
 * @typeParam S - The settings for the fighter.
 */
type CharacterInitializer<F extends FighterClient, S extends {}> = (character: CharacterRigR6, settings?: S) => F;

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
	wavedashTractionApplied: boolean;
	previousHeartbeatGrounded: boolean;
};

const camera = Workspace.CurrentCamera as Camera;

// TODO: make a hitbox handler that sends a signal to the server to actually check for the hitbox

/**
 * The function that returns the default behavior for the characters.
 * Intended to be extended. DO NOT make this an independent character.
 */
export const defaults: CharacterInitializer<DefaultMovement, MovementSettings> = (
	character,
	settings = defaultMovementSettings,
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
		remainingJumps: settings.jumpAmount,
		dashed: false,
		fastfalled: false,
		canWavedash: false,
		wavedashTractionApplied: false,

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

			rootpart.ApplyImpulse(Vector3.yAxis.mul(-rootpart.AssemblyLinearVelocity.Y * mass));

			if (walljumpRay) {
				const sound = playSound("rbxassetid://142245269");
				sound.TimePosition = 0.1;

				rootpart.ApplyImpulse(
					walljumpRay.Normal.mul(mass * settings.walljumpBounceSpeed).add(
						Vector3.yAxis.mul(mass * settings.jumpSpeed),
					),
				);
				return;
			}

			rootpart.ApplyImpulse(Vector3.yAxis.mul(mass * settings.jumpSpeed));
			defaultMovement.remainingJumps--;
		},

		fastfall: () => {
			if (!defaultMovement.fastfalled) {
				rootpart.ApplyImpulse(Vector3.yAxis.mul(-rootpart.AssemblyLinearVelocity.Y * mass));
				rootpart.ApplyImpulse(Vector3.yAxis.mul(-mass * settings.fastFallSpeed));
				defaultMovement.fastfalled = true;
			}
		},

		airdash: () => {
			if (!defaultMovement.dashed) {
				rootpart.ApplyImpulse(
					humanoid.MoveDirection.mul(settings.airdashSpeed * mass).add(
						Vector3.yAxis.mul(camera.CFrame.LookVector.Y * settings.airdashSpeed * mass),
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
				defaultMovement.remainingJumps = settings.jumpAmount;
				defaultMovement.dashed = false;
				defaultMovement.fastfalled = false;

				if (defaultMovement.canWavedash) {
					defaultMovement.canWavedash = false;
					const ground = groundCast.Instance;
					const previousProperties = ground.CustomPhysicalProperties;

					// god this code is so bad
					ground.CustomPhysicalProperties = new PhysicalProperties(
						previousProperties ? previousProperties.Density : 0.7,
						previousProperties ? previousProperties.Friction : 0,
						previousProperties ? previousProperties.Elasticity : 0.5,
						previousProperties ? previousProperties.FrictionWeight : 100,
						previousProperties ? previousProperties.ElasticityWeight : 1,
					);
					defaultMovement.wavedashTractionApplied = true;

					rootpart.ApplyImpulse(humanoid.MoveDirection.mul(mass * settings.wavedashSpeed));

					task.wait(0.1);

					if (defaultMovement.wavedashTractionApplied) {
						ground.CustomPhysicalProperties = previousProperties;
						defaultMovement.wavedashTractionApplied = false;
					}
				}
			}

			defaultMovement.previousHeartbeatGrounded = grounded;
		}),
	);

	return defaultMovement;
};

export const testCharacter: CharacterInitializer<DefaultMovement, CharacterSettings> = (
	character,
	settings = testCharacterSettings,
) => {
	return {
		...defaults(character),
		// make the default handler detect if the hitbox was hit and send a remote event for server verification
		// neutral_air: defaultfunctionorsomething(settings.neutral_air)
	};
};
