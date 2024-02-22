// taken from https://github.com/red-blox/Util/blob/main/libs/Spawn/Spawn.luau

const freeThreads: thread[] = [];

function runCallback(callback: (...args: unknown[]) => unknown, thread: thread, ...args: unknown[]) {
	callback(...args);
	freeThreads.push(thread);
}

function yielder() {
	for (;;) {
		// i have forsaken god himself
		const [callback, thread, args] = coroutine.yield() as LuaTuple<
			[(...args: unknown[]) => unknown, thread, ...args: unknown[]]
		>;
		runCallback(callback, thread, args);
	}
}

export const Spawn = <T extends unknown[]>(callback: (...args: T) => void, ...args: T) => {
	let thread;

	if (freeThreads.size() > 0) {
		thread = freeThreads[freeThreads.size() - 1];
		freeThreads.remove(freeThreads.size() - 1);
	} else {
		thread = coroutine.create(yielder);
		coroutine.resume(thread);
	}

	task.spawn(thread, callback, thread, ...args);
};
