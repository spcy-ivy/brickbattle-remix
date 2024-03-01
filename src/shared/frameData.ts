/*
 * ok so the way the hitboxes will work will be a bit strange
 * so lets make psudocode
 *
 * ```
 * const hitbox = new Hitbox();
 * const startingTime = os.clock();
 *
 * // capt falcon knee example
 * // https://meleeframedata.com/captain_falcon
 * hitbox.Touched(() => {
 *   const attackFrame = framesSince(startingTime);
 *   if (attackFrame >= 14 && attackFrame <= 16) {
 *     // strong hitbox
 *   } else {
 *     // normal hitbox
 *   }
 * })
 *
 * task.wait(3 / FPS) // to wait three frames
 *
 * hitbox.End()
 * ```
 *
 * hope this makes sense lmao
 */

export const FPS = 60;

// i know its bad code but ITS A ONE LINER COME ON ITS SATISFYING
export function framesSince(startingTime: number) {
	return (os.clock() - startingTime).idiv(1 / FPS);
}
