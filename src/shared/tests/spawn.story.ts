import { Spawn } from "shared/spawn";

export = () => {
	print("this should print first");

	Spawn(() => {
		task.wait(1);
		print("this should print last");
	});

	print("this should print second");
	Spawn(print, "argument test lmao");
};
