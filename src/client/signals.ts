import { signal } from "shared/signal";
import { FighterAction } from "./inputs.client";
// i dont CARE if its a stupid solution IT WORKS!

export const actionSignal = signal<FighterAction | undefined>();
