import * as vscode from 'vscode';

export class PomodoroTimer {
    private interval?: NodeJS.Timeout;
    private remaining: number = 0;
    private onTickCallback: ((minutes: number, seconds: number) => void) | undefined;
    private onEndCallback: (() => void) | undefined;

    start(minutes: number) {
        this.stop();
        this.remaining = minutes * 60;
        this.tick();

        this.interval = setInterval(() => {
            this.remaining -= 1;
            this.tick();
            if (this.remaining <= 0) {
                this.stop();
                if (this.onEndCallback) this.onEndCallback();
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    onTick(callback: (min: number, sec: number) => void) {
        this.onTickCallback = callback;
    }

    onEnd(callback: () => void) {
        this.onEndCallback = callback;
    }

    private tick() {
        const min = Math.floor(this.remaining / 60);
        const sec = this.remaining % 60;
        if (this.onTickCallback) this.onTickCallback(min, sec);
    }
}
