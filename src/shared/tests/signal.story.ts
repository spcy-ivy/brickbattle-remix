import { signal } from "shared/signal";

export = () => {
	const testSignal = signal<number>();

	print("starting signal test!");

	print("creating connection that prints the argument");
	const disconnect = testSignal.connect((n) => print(n));
	testSignal.once((n) => print(`this is once but heres the number: ${n}`));

	print("fire the signal with the number 32");
	testSignal.fire(32);

	print("disconnect it");
	disconnect();

	print("fire again to see if it prints");
	print("also to check if once worked");
	task.spawn(() => {
		testSignal.wait();
		print("also to check if wait worked");
	});

	testSignal.fire(32);
};
