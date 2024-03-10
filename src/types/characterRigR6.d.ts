/**
 * Yeah I know this type seems unnecessary but its helpful when interacting with raycast hitboxes.
 */
type BodyParts = {
	HumanoidRootPart: Part;
	Humanoid: Humanoid;
};

/**
 * Just supposed to override an existing model type to allow for all usual rig children.
 */
export type CharacterRigR6 = Model & BodyParts;
