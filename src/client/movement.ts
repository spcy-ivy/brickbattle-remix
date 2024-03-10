import { Players, RunService, Workspace } from "@rbxts/services";
import { playSound } from "shared/playSound";
import { CharacterRigR6 } from "types/characterRigR6";
import { Cleanup } from "shared/cleanup";
import { actionSignal } from "./signals";

const fastFallSpeed = 50;
const jumpSpeed = 60;
const dashSpeed = 50;
const walljumpBounceSpeed = 50;
const wavedashSpeed = 20;
const jumpAmount = 2;

const groundedCheckDistance = 1;
const walljumpCheckDistance = 3;
const wavedashTimeWindow = 0.1;

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
	let wavedashTractionApplied = false;

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
					canWavedash = false;
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
					wavedashTractionApplied = true;

					rootpart.ApplyImpulse(humanoid.MoveDirection.mul(mass * wavedashSpeed));

					task.wait(0.1);

					if (wavedashTractionApplied) {
						ground.CustomPhysicalProperties = previousProperties;
						wavedashTractionApplied = false;
					}
				}
			}

			previousHeartbeatGrounded = grounded;
		}),
	);

	cleanup.add(
		actionSignal.connect((action) => {
			if (action === "FastFall") {
				if (!fastfalled) {
					rootpart.ApplyImpulse(Vector3.yAxis.mul(-rootpart.AssemblyLinearVelocity.Y * mass));
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

				rootpart.ApplyImpulse(Vector3.yAxis.mul(-rootpart.AssemblyLinearVelocity.Y * mass));

				if (walljumpRay) {
					const sound = playSound("rbxassetid://142245269");
					sound.TimePosition = 0.1;

					rootpart.ApplyImpulse(
						walljumpRay.Normal.mul(mass * walljumpBounceSpeed).add(Vector3.yAxis.mul(mass * jumpSpeed)),
					);
					return;
				}

				rootpart.ApplyImpulse(Vector3.yAxis.mul(mass * jumpSpeed));
				remainingJumps--;
			}
		}),
	);
});
