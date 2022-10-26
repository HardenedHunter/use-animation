import { useCallback, useRef } from "react";

export type Sprites<T> = [T, ...T[]];

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

type TimeoutData = {
    id?: NodeJS.Timer;
    callback: VoidFunction;
    delay: number;
};

type AnimationChangeHandler<T> = (payload: {
    index: number;
    sprites: Sprites<T>;
    timeout?: TimeoutData;
}) => void;

export type AnimationFunction<T> = (params: AnimationParams<T>) => void;

type AnimationState = {
    index: number;
    timeout?: TimeoutData;
};

export type AnimationActions<T> = {
    play: AnimationFunction<T>;
    pause: VoidFunction;
    resume: VoidFunction;
};

const initialState: AnimationState = { index: 0 };

const iterateAnimation = <T>(
    index: number,
    config: AnimationIterationConfig<T>,
    delay: number,
    onChange: AnimationChangeHandler<T>
) => {
    const { next, repeat, sprites } = config;

    const animationLength = sprites.length;
    const isLastSprite = index === animationLength - 1;
    const newIndex = (index + 1) % animationLength;

    if (!isLastSprite || repeat === -1) {
        const callback = () =>
            iterateAnimation(newIndex, config, delay, onChange);
        const id = setTimeout(callback, delay);
        const timeout = { id, callback, delay };

        onChange({ index, timeout, sprites });
        return;
    }

    if (repeat > 1) {
        const callback = () =>
            iterateAnimation(
                newIndex,
                { ...config, repeat: repeat - 1 },
                delay,
                onChange
            );
        const id = setTimeout(callback, delay);
        const timeout = { id, callback, delay };

        onChange({ index, timeout, sprites });
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
    timeout?: TimeoutData
) => {
    if (timeout && timeout.id) {
        clearTimeout(timeout.id);
    }

    const { repeat } = config;

    const animationConfig =
        repeat === undefined
            ? { ...config, repeat: 1 }
            : (config as AnimationIterationConfig<T>);

    iterateAnimation(0, animationConfig, delay, onChange);
};

const useAnimation = <T>(): AnimationActions<T> => {
    const stateRef = useRef<AnimationState>(initialState);

    const play: AnimationFunction<T> = useCallback(
        (params: AnimationParams<T>) => {
            const { delay, onSpriteChange, config } = params;

            playAnimation(
                config,
                delay,
                (payload) => {
                    stateRef.current = payload;
                    onSpriteChange?.(payload.sprites[payload.index] as string);
                },
                stateRef.current.timeout
            );
        },
        []
    );

    const pause = useCallback(() => {
        if (stateRef.current.timeout && stateRef.current.timeout.id) {
            clearTimeout(stateRef.current.timeout.id);
            stateRef.current.timeout.id = undefined;
        }
    }, []);

    const resume = useCallback(() => {
        if (stateRef.current.timeout && !stateRef.current.timeout.id) {
            const { callback, delay } = stateRef.current.timeout;

            const id = setTimeout(callback, delay);
            stateRef.current.timeout.id = id;
        }
    }, []);

    return { play, pause, resume };
};

export default useAnimation;
