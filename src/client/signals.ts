import { Signal } from "shared/signal";
import { MovementAction } from "./movement.client";

// i dont CARE if its a stupid solution IT WORKS!

export const actionSignal = Signal<MovementAction>();
