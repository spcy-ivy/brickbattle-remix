import { Players, RunService, StarterPlayer, UserInputService, Workspace } from "@rbxts/services";
import { Cleanup } from "shared/cleanup";
import { CharacterRigR6 } from "types/characterRigR6";

const renderStepName = "CameraLock";
const cleanup = Cleanup();
const camera = Workspace.CurrentCamera as Camera;

StarterPlayer.EnableMouseLockOption = false;

Players.LocalPlayer.CharacterAppearanceLoaded.Connect((model) => {
	const character = model as CharacterRigR6;
	const rootpart = character.HumanoidRootPart;
	const humanoid = character.Humanoid;

	humanoid.CameraOffset = new Vector3(1.75, 0, 0);

	RunService.BindToRenderStep(renderStepName, Enum.RenderPriority.Character.Value, () => {
		UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
		const [_x, y, _z] = camera.CFrame.Rotation.ToEulerAnglesYXZ();
		rootpart.CFrame = new CFrame(rootpart.Position).mul(CFrame.Angles(0, y, 0));
	});

	cleanup.add(() => {
		RunService.UnbindFromRenderStep(renderStepName);
	});

	humanoid.Died.Connect(() => {
		cleanup.empty();
	});
});
