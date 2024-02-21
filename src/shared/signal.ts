// yeah yeah i know this isnt technically a signal since its an array of callbacks instead of a linked list but shut up
// taken from https://github.com/Sleitnick/rbxts-beacon/blob/main/src/index.ts#L141
// and https://github.com/red-blox/Util/blob/main/libs/Signal/Signal.luau

type SignalParams<T> = Parameters<
	T extends unknown[] ? (...args: T) => never : T extends unknown ? (arg: T) => never : () => never
>;
type SignalCallback<T> = (...args: SignalParams<T>) => unknown;
type SignalWait<T> = T extends unknown[] ? LuaTuple<T> : T;

export function Signal<T extends unknown[] | unknown>() {
	const callbacks: SignalCallback<T>[] = [];

	const connect = (callback: SignalCallback<T>) => {
		const index = callbacks.push(callback);

		return () => {
			callbacks.remove(index);
		};
	};

	// sorry cant name it wait yeah i know its uncomfortable but please shut up
	const signalWait = () => {
		const thread = coroutine.running();

		const disconnect = connect((...args) => {
			disconnect();
			coroutine.resume(thread, ...args);
		});

		return coroutine.yield() as SignalWait<T>;
	};

	const once = (callback: SignalCallback<T>) => {
		const disconnect = connect((...args) => {
			disconnect();
			callback(...args);
		});
	};

	const fire = (...args: SignalParams<T>) => {
		callbacks.forEach((callback) => {
			task.spawn(callback, ...args);
		});
	};

	const disconnectAll = () => {
		callbacks.clear();
	};

	return {
		connect: connect,
		wait: signalWait,
		once: once,
		fire: fire,
		disconnectAll: disconnectAll,
	};
}
