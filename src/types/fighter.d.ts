// the client option fo rthe fighter
// mostly covers movement options
// has attack functions on the client side because

export type Fighter = {
	neutral_attack: () => void;
	neutral_air: () => void;
	neutral_strong: () => void;
};

export type FighterClient = Partial<Fighter> & {
	jump: () => void;
	fastfall: () => void;
	airdash: () => void;
};
