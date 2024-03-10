import { AttackTypes } from "types/fighter";
import { Hitbox } from "types/hitbox";

/**
 * The settings for the default movement system.
 *
 * @param fastFallSpeed - The downward velocity applied for fast falls.
 * @param jumpSpeed - The upward velocity applied for jumps.
 * @param airdashSpeed - The velocity applied for airdashes.
 * @param walljumpBounceSpeed - The velocity applied for walljumps.
 * @param wavedashSpeed - The velocity applied for wavedashes.
 * @param jumpAmount - The amount of jumps the character has.
 */
export type MovementSettings = {
	fastFallSpeed: number;
	jumpSpeed: number;
	airdashSpeed: number;
	walljumpBounceSpeed: number;
	wavedashSpeed: number;
	jumpAmount: number;
};

/**
 * A list of hitboxes assigned to all attack types.
 */
type HitboxSettings = { [index in AttackTypes]: Hitbox[] };

/**
 * Combines the MovementSettings with a dictionary that defines hitboxes for each attack.
 */
export type CharacterSettings = MovementSettings & HitboxSettings;

// these two are mostly just a fallback for when a character's full moveset isnt developed
// dont actually use, just strictly for development and movement purposes
const noHitbox: Hitbox[] = [{ bodyPart: "HumanoidRootPart", points: [], frameLength: 49 }];

const noHitboxes: HitboxSettings = {
	neutral_attack: noHitbox,
	neutral_air: noHitbox,
	neutral_strong: noHitbox,
};

export const defaultMovementSettings: CharacterSettings = {
	fastFallSpeed: 50,
	jumpSpeed: 60,
	airdashSpeed: 50,
	walljumpBounceSpeed: 50,
	wavedashSpeed: 20,
	jumpAmount: 2,
	...noHitboxes,
} as const;

export const testCharacterSettings: CharacterSettings = {
	...defaultMovementSettings,
	neutral_air: [{ bodyPart: "HumanoidRootPart", points: [Vector3.zero], frameLength: 49 }],
} as const;
