import { Players, RunService, Workspace } from "@rbxts/services";
import { playSound } from "shared/playSound";
import { CharacterRigR6 } from "types/characterRigR6";
import { actionSignal } from "./signals";
import { Cleanup } from "shared/cleanup";

const fastFallSpeed = 50;
const jumpSpeed = 60;
const dashSpeed = 50;
const walljumpBounceSpeed = 50;
const wavedashSpeed = 20;
const jumpAmount = 2;

const groundedCheckDistance = 1;
const walljumpCheckDistance = 3;
const wavedashTimeWindow = 0.1;
const momentumTimeWindow = 0.2;

export type MovementAction = "FastFall" | "Airdash" | "Jump" | "None";

const cleanup = Cleanup();

// can we please just assume this exists lmao
const camera = Workspace.CurrentCamera as Camera;

const player = Players.LocalPlayer;
player.CharacterAppearanceLoaded.Connect((model) => {
	const character = model as CharacterRigR6;

	const characterCastParams = new RaycastParams();
	characterCastParams.FilterType = Enum.RaycastFilterType.Exclude;
	characterCastParams.FilterDescendantsInstances = [character];

	const rootpart = character.HumanoidRootPart;
	const humanoid = character.Humanoid;
	const mass = character
		.GetChildren()
		.filter((part): part is BasePart => part.IsA("BasePart"))
		.reduce((total, part) => total + part.Mass, 0);

	let remainingJumps = jumpAmount;
	let dashed = false;
	let fastfalled = false;
	let canWavedash = false;
	let momentum = 0;

	// have this set becuase it checks like every heartbeat and jumping takes time lmao
	let previousHeartbeatGrounded = false;

	humanoid.WalkSpeed = 32;
	humanoid.JumpPower = 0;

	humanoid.Died.Connect(() => {
		cleanup.empty();
	});

	cleanup.add(
		RunService.Heartbeat.Connect(() => {
			const groundCast = Workspace.Blockcast(
				rootpart.CFrame,
				new Vector3(2, 1, 1),
				Vector3.yAxis.mul(-3 - groundedCheckDistance),
				characterCastParams,
			);

			const grounded = groundCast !== undefined;

			if (grounded && !previousHeartbeatGrounded) {
				remainingJumps = jumpAmount;
				dashed = false;
				fastfalled = false;

				if (canWavedash) {
					rootpart.ApplyImpulse(humanoid.MoveDirection.mul(mass * wavedashSpeed));
					momentum = 75;
					task.wait(momentumTimeWindow);
					momentum = 0;
				}
			}

			previousHeartbeatGrounded = grounded;
		}),
	);

	cleanup.add(
		actionSignal.connect((action) => {
			if (action === "FastFall") {
				if (!fastfalled) {
					rootpart.AssemblyLinearVelocity = rootpart.AssemblyLinearVelocity.mul(Vector3.yAxis.mul(0));
					rootpart.ApplyImpulse(Vector3.yAxis.mul(-mass * fastFallSpeed));
					fastfalled = true;
				}
			}

			if (action === "Airdash") {
				if (!dashed) {
					rootpart.ApplyImpulse(
						humanoid.MoveDirection.mul(dashSpeed * mass).add(
							Vector3.yAxis.mul(camera.CFrame.LookVector.Y * dashSpeed * mass),
						),
					);
					dashed = true;

					canWavedash = true;
					task.wait(wavedashTimeWindow);
					canWavedash = false;
				}
			}

			if (action === "Jump") {
				if (remainingJumps < 1) {
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
						walljumpRay.Normal.mul(mass * walljumpBounceSpeed).add(Vector3.yAxis.mul(mass * jumpSpeed)),
					);
					return;
				}

				rootpart.ApplyImpulse(
					Vector3.yAxis.mul(mass * jumpSpeed).add(humanoid.MoveDirection.mul(mass * momentum)),
				);
				remainingJumps--;
			}
		}),
	);
});
