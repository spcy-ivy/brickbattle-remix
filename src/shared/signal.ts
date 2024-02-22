// yeah yeah i know this isnt technically a signal since its an array of callbacks instead of a linked list but shut up
// taken from https://github.com/Sleitnick/rbxts-beacon/blob/main/src/index.ts#L141
// and https://github.com/red-blox/Util/blob/main/libs/Signal/Signal.luau

import { Spawn } from "./spawn";

type SignalParams<T> = Parameters<
	T extends unknown[] ? (...args: T) => never : T extends unknown ? (arg: T) => never : () => never
>;
type SignalCallback<T> = (...args: SignalParams<T>) => unknown;
type SignalWait<T> = T extends unknown[] ? LuaTuple<T> : T;

type SignalNode<T extends unknown | unknown[]> = {
	next?: SignalNode<T>;
	callback: SignalCallback<T>;
};

export function Signal<T extends unknown | unknown[]>() {
	let root: SignalNode<T> | undefined = undefined;

	const connect = (callback: SignalCallback<T>) => {
		const node: SignalNode<T> = {
			next: root,
			callback: callback,
		};

		root = node;

		return () => {
			if (root === node) {
				root = node.next;
				return;
			}

			let current = root;

			while (current) {
				if (current.next === node) {
					current.next = node.next;
					break;
				}

				current = current.next;
			}
		};
	};

	// sorry kids i have to make this the name
	function signalWait() {
		const thread = coroutine.running();

		const disconnect = connect((...args) => {
			disconnect();
			coroutine.resume(thread, ...args);
		});

		return coroutine.yield() as SignalWait<T>;
	}

	function once(callback: SignalCallback<T>) {
		const disconnect = connect((...args) => {
			disconnect();
			callback(...args);
		});

		return disconnect;
	}

	function fire(...args: SignalParams<T>) {
		let current = root;

		while (current) {
			Spawn(current.callback, ...args);
			current = current.next;
		}
	}

	function disconnectAll() {
		root = undefined;
	}

	return {
		root: root,
		connect: connect,
		wait: signalWait,
		once: once,
		fire: fire,
		disconnectAll: disconnectAll,
	};
}
