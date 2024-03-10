import { signal } from "shared/signal";
import { FighterAction } from "./inputs.client";
// i dont CARE if its a stupid solution IT WORKS!

/**
 * The shared signal used to communicate the player's `FighterAction` between scripts.
 * Useful for platforms that need to detect movement or other applications.
 */
export const actionSignal = signal<FighterAction | undefined>();
