/**
 * A utility type that represents every type of attack you can do.
 * It's a headache to enter all the indexes manually in the type definitions.
 * This is so much abstraction.... oh no...
 */
type AttackTypes = "neutral_attack" | "neutral_air" | "neutral_strong";

/**
 * Just a list of functions to see what each move does.
 * Mainly intended for use in the server.
 */
export type Fighter = { [index in AttackTypes]: () => void };

/**
 * An extension of the fighter type specifically for defining client side movement functions and gives you the tools to manipulate some client stuff for attacks.
 */
export type FighterClient = Partial<Fighter> & {
	jump: () => void;
	fastfall: () => void;
	airdash: () => void;
};
