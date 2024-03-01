// taken from: https://github.com/littensy/slither/blob/66bd1b6c321823184f36cc388b8d20b8d2a4d0bb/src/shared/assets/sounds/play-sound.ts#L26

import { SoundService } from "@rbxts/services";

export type SoundOptions = {
	volume?: number;
	speed?: number;
	looped?: boolean;
	parent?: Instance;
};

export function createSound(
	soundId: string,
	{ volume = 0.5, speed = 1, looped = false, parent = SoundService }: SoundOptions = {},
) {
	const sound = new Instance("Sound");

	sound.SoundId = soundId;
	sound.Volume = volume;
	sound.PlaybackSpeed = speed;
	sound.Looped = looped;
	sound.Parent = parent;

	return sound;
}

export function playSound(soundId: string, options?: SoundOptions) {
	const sound = createSound(soundId, options);

	sound.Ended.Connect(() => sound.Destroy());
	sound.Play();

	return sound;
}
