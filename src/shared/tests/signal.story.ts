import { Signal } from "shared/signal";

export = () => {
	const signal = Signal<number>();

	print("starting signal test!");

	print("creating connection that prints the argument");
	const disconnect = signal.connect((n) => print(n));
	signal.once((n) => print(`this is once but heres the number: ${n}`));

	print("fire the signal with the number 32");
	signal.fire(32);

	print("disconnect it");
	disconnect();

	print("fire again to see if it prints");
	print("also to check if once worked");
	task.spawn(() => {
		signal.wait();
		print("also to check if wait worked");
	});

	signal.fire(32);
};
