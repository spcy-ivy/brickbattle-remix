import { VoiceChatService, Workspace } from "@rbxts/services";
import { Cleanup } from "shared/cleanup";
import { hitbox, hitboxRuntime, clearDebugAdornmentCache } from "shared/hitbox";

export = () => {
	const cleanup = Cleanup();
	const runtime = hitboxRuntime();

	cleanup.add(runtime);

	const part1 = new Instance("Part");
	part1.Name = "Part1";
	part1.Anchored = true;
	part1.Position = Vector3.yAxis.mul(3);
	part1.Parent = Workspace;
	cleanup.add(part1);

	const part2 = new Instance("Part");
	part2.Name = "Part2";
	part2.Anchored = true;
	part2.Position = Vector3.yAxis.mul(5);
	part2.Color = Color3.fromHex("#FF0000");
	part2.Parent = Workspace;
	cleanup.add(part2);

	const hitbox1 = hitbox({ part: part1 });
	const hitbox2 = hitbox({ part: part2 });

	hitbox1.setPoints([Vector3.zero, Vector3.xAxis.mul(2), Vector3.xAxis.mul(-2)]);
	hitbox2.setPoints([Vector3.zero]);

	print("gonna be waiting 10 seconds until the second hitbox is destroyed");
	const removeThread = task.delay(10, () => {
		hitbox2.stop();
	});

	cleanup.add(() => {
		task.cancel(removeThread);
	});

	cleanup.add(() => {
		hitbox1.destroy();
		hitbox2.destroy();
	});

	return () => {
		cleanup.empty();
		clearDebugAdornmentCache();
	};
};

