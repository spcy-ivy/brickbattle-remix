import { Workspace } from "@rbxts/services";
import { Cleanup } from "shared/cleanup";

export = () => {
	const cleanup = Cleanup();

	print("starting Bin test!");

	print("creating red part at position (0, 1, 0)");
	const redPart = new Instance("Part");
	redPart.Anchored = true;
	redPart.Position = Vector3.yAxis.mul(1);
	redPart.Parent = Workspace;

	print("creating blue part at position (0, 2, 0)");
	const bluePart = new Instance("Part");
	bluePart.Anchored = true;
	bluePart.Position = Vector3.yAxis.mul(2);
	bluePart.Parent = Workspace;

	print("creating green part at position (0, 3, 0)");
	const greenPart = new Instance("Part");
	greenPart.Anchored = true;
	greenPart.Position = Vector3.yAxis.mul(3);
	greenPart.Parent = Workspace;

	print("lets add the parts to the bin!");
	cleanup.add(redPart);
	cleanup.add(bluePart);
	cleanup.add(greenPart);

	print("lets wait for 5 seconds to make sure that you see the parts");
	task.delay(5, () => {
		print("emptying bin!");
		cleanup.empty();

		print("if this errored, please manually delete the parts before testing again.");
	});
};
