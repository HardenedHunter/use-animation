import { useCallback, useRef } from "react";

import { Sprites } from "../utils";

export type AnimationConfig<T> = {
    sprites: Sprites<T>;
    /**
     * Animation repeat count. Should be a positive integer or -1 (infinite repeat), default value is 1
     */
    repeat?: number;
    next?: AnimationConfig<T>;
};

type AnimationIterationConfig<T> = AnimationConfig<T> & {
    repeat: number;
};

export type AnimationParams<T> = {
    delay: number;
    onSpriteChange?: (sprite: string) => void;
    config: AnimationConfig<T>;
};

export type AnimationChangeHandler<T> = (payload: {
    index: number;
    sprites: Sprites<T>;
    timeoutId?: NodeJS.Timer;
}) => void;

export type AnimationFunction<T> = (params: AnimationParams<T>) => void;

type AnimationState = {
    index: number;
    timeoutId?: NodeJS.Timer;
};

const initialState: AnimationState = { index: 0 };

const iterateAnimation = <T>(
    index: number,
    config: AnimationIterationConfig<T>,
    delay: number,
    onChange: AnimationChangeHandler<T>
) => {
    let { repeat } = config;
    const { next, sprites } = config;

    const animationLength = sprites.length;
    const isLastSprite = index === animationLength - 1;
    const newIndex = (index + 1) % animationLength;

    if (!isLastSprite || repeat === -1) {
        const timeoutId = setTimeout(
            () => iterateAnimation(newIndex, config, delay, onChange),
            delay
        );

        onChange({ index, timeoutId, sprites });
        return;
    }

    if (repeat > 1) {
        repeat -= 1;

        const timeoutId = setTimeout(
            () =>
                iterateAnimation(
                    newIndex,
                    { ...config, repeat },
                    delay,
                    onChange
                ),
            delay
        );

        onChange({ index, timeoutId, sprites });
        return;
    }

    if (next) {
        setTimeout(() => playAnimation(next, delay, onChange), delay);
    }

    onChange({ index, sprites });
};

const playAnimation = <T>(
    config: AnimationConfig<T>,
    delay: number,
    onChange: AnimationChangeHandler<T>,
    timeoutId?: NodeJS.Timer
) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    const { repeat } = config;

    const animationConfig =
        repeat === undefined
            ? { ...config, repeat: 1 }
            : (config as AnimationIterationConfig<T>);

    iterateAnimation(0, animationConfig, delay, onChange);
};

const useAnimation = <T>() => {
    const stateRef = useRef<AnimationState>(initialState);

    const animate: AnimationFunction<T> = useCallback(
        (params: AnimationParams<T>) => {
            const { delay, onSpriteChange, config } = params;

            playAnimation(
                config,
                delay,
                (payload) => {
                    stateRef.current = payload;
                    onSpriteChange?.(payload.sprites[payload.index] as string);
                },
                stateRef.current.timeoutId
            );
        },
        []
    );

    return animate;
};

export default useAnimation;
