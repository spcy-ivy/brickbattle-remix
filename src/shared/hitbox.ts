import { RunService, Workspace } from "@rbxts/services";
import { Signal, signal } from "./signal";

const visualizeDebug = true;

type DebugAdornment = {
	adornment: LineHandleAdornment;
	lastUse: number;
};

type Point = {
	offset: Vector3;
	group?: string;
	lastPosition?: Vector3;
	worldSpace?: Vector3;
};

type Hitbox = {
	part: BasePart;
	enabled: boolean;
	destroying: boolean;
	lastPosition?: Vector3;
	raycastPoints: Point[];
	alreadyHit: Map<Humanoid, boolean>;
	onHit: Signal<[BasePart, Humanoid, RaycastResult, string?]>;

	start: () => void;
	stop: () => void;
	destroy: () => void;
	setPoints: (offsets: Vector3[], group?: string) => void;
	removePoints: (offsets: Vector3[]) => void;
};

type HitboxProps = {
	part: BasePart;
};

const reservedAdornments: DebugAdornment[] = [];
const adornmentsInUse: DebugAdornment[] = [];

function createDebugAdornment(): DebugAdornment {
	const adornment = new Instance("LineHandleAdornment");
	adornment.Name = "_RaycastHitboxDebugLine";
	adornment.Color3 = Color3.fromRGB(255, 0, 0);
	adornment.Thickness = 4;

	adornment.Length = 0;
	adornment.CFrame = new CFrame(0, math.huge, 0);

	adornment.Adornee = Workspace.Terrain;
	adornment.Parent = Workspace.Terrain;

	return {
		adornment: adornment,
		lastUse: 0,
	};
}

function retrieveDebugAdornment(): DebugAdornment | undefined {
	if (reservedAdornments.size() <= 0) {
		reservedAdornments.push(createDebugAdornment());
	}

	const adornment = reservedAdornments.remove(0);

	if (adornment) {
		adornment.adornment.Visible = true;
		adornment.lastUse = os.clock();
		adornmentsInUse.push(adornment);
	}

	return adornment;
}

function cacheDebugAdornment(adornment: DebugAdornment) {
	adornment.adornment.Length = 0;
	adornment.adornment.Visible = false;
	adornment.adornment.CFrame = new CFrame(0, math.huge, 0);
	reservedAdornments.push(adornment);
}

export function clearDebugAdornmentCache() {
	reservedAdornments.forEach((adornment, index) => {
		adornment.adornment.Destroy();
		reservedAdornments.remove(index);
	});
}

const activeHitboxes: Hitbox[] = [];

// brace for some indenting kids
export function hitbox({ part }: HitboxProps): Hitbox {
	const hitbox: Hitbox = {
		part: part,
		enabled: false,
		destroying: false,
		raycastPoints: [],
		alreadyHit: new Map<Humanoid, boolean>(),
		onHit: signal(),

		start: () => {
			hitbox.enabled = true;
			activeHitboxes.push(hitbox);
		},
		stop: () => {
			hitbox.enabled = false;
			hitbox.alreadyHit.clear();
		},
		destroy: () => {
			hitbox.stop();
			hitbox.destroying = true;
		},
		setPoints: (offsets: Vector3[], group?: string) => {
			offsets.forEach((offset, _index) => {
				hitbox.raycastPoints.push({
					offset: offset,
					group: group,
					lastPosition: undefined,
					worldSpace: undefined,
				});
			});
		},
		removePoints: (offsets: Vector3[]) => {
			hitbox.raycastPoints.forEach((point) => {
				offsets.forEach((offset, index) => {
					if (offset === point.offset) {
						hitbox.raycastPoints.remove(index);
					}
				});
			});
		},
	};

	hitbox.start();

	return hitbox;
}

export function hitboxRuntime() {
	return RunService.Heartbeat.Connect(() => {
		activeHitboxes.forEach((hitbox, index) => {
			if (hitbox.destroying) {
				activeHitboxes.remove(index);
				table.clear(hitbox);
				return;
			}

			hitbox.raycastPoints.forEach((point) => {
				if (!hitbox.enabled) {
					point.lastPosition = undefined;
					return;
				}

				const originOffset = hitbox.part.Position.add(hitbox.part.CFrame.VectorToWorldSpace(point.offset));

				if (!point.lastPosition) {
					point.lastPosition = originOffset;
				}

				// const origin = point.lastPosition;
				const direction = originOffset.sub(point.lastPosition);

				point.worldSpace = originOffset;

				const raycastResult = Workspace.Raycast(point.lastPosition, originOffset.sub(point.lastPosition));

				if (visualizeDebug) {
					const adornment = retrieveDebugAdornment();

					if (adornment) {
						const debugStartPosition = CFrame.lookAt(point.worldSpace, point.lastPosition);
						adornment.adornment.Length = direction.Magnitude;
						adornment.adornment.CFrame = debugStartPosition;
					}
				}

				point.lastPosition = point.worldSpace;

				if (!raycastResult) {
					return;
				}

				const part = raycastResult.Instance;
				const model = part.FindFirstAncestorWhichIsA("Model");

				if (!model) {
					return;
				}

				const humanoid = part.FindFirstChildWhichIsA("Humanoid");

				if (!humanoid) {
					return;
				}

				if (hitbox.alreadyHit.get(humanoid)) {
					return;
				}

				hitbox.alreadyHit.set(humanoid, true);
				hitbox.onHit.fire(part, humanoid, raycastResult, point.group);
			});
		});

		if (adornmentsInUse.size() > 0) {
			adornmentsInUse.forEach((adornment, index) => {
				if (os.clock() - adornment.lastUse > 0.25) {
					adornmentsInUse.remove(index);
					cacheDebugAdornment(adornment);
				}
			});
		}
	});
}

if (RunService.IsStudio()) {
	warn(
		"You probably called this module on a story! If no hitbox stuff is happening, try importing the `HitboxRuntime` function!",
	);
} else {
	hitboxRuntime();
}
