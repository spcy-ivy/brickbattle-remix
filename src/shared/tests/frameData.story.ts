import { FPS, framesSince } from "shared/frameData";
import { Spawn } from "shared/spawn";

export = () => {
	Spawn(() => {
		const startingTime = os.clock();
		task.wait(1 / FPS);
		print(framesSince(startingTime));
	});
};
