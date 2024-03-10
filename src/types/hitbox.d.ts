import { BodyParts } from "./characterRigR6";

/**
 * The default hitbox types.
 * Normal just.... damages and applies hitstun.
 * Spike is normal but you QUICKLY drop to the floor.
 */
type DefaultHitboxTypes = "normal" | "spike";

/**
 * Just an array of different hitbox types... That also contain Vector3 offsets for `hitbox.setPoints` and which bodypart to offset by...
 *
 * @param bodyPart - The body part where the point positions are offset.
 * @param points - The offsets from `bodyPart` where the rays are cast for the hitbox.
 * @param hitboxType - Self explanatory. Should be "normal" by default.
 */
export type Hitbox = {
	bodyPart: keyof BodyParts;
	points: Vector3[];
	frameLength: number;
	hitboxType?: DefaultHitboxTypes;
};
