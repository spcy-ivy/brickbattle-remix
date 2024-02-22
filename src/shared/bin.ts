// taken from: https://github.com/red-blox/Util/blob/main/libs/Bin/Bin.luau

import { Spawn } from "./spawn";

type BinItem = Instance | RBXScriptConnection | Promise<unknown> | (() => void);

export function Bin() {
	const bin: BinItem[] = [];

	return {
		add: (item: BinItem) => bin.push(item),
		empty: () => {
			bin.forEach((item) => {
				if (typeIs(item, "Instance")) {
					item.Destroy();
				} else if (typeIs(item, "RBXScriptConnection")) {
					item.Disconnect();
				} else if (typeIs(item, "function")) {
					Spawn(item);
				} else if (Promise.is(item)) {
					(item as Promise<unknown>).cancel();
				}
			});

			bin.clear();
		},
	};
}
