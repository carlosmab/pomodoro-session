export class PomodoroSession {
    private interval: NodeJS.Timeout | null = null;
    private currentTime: number = 0;
    private isRunning: boolean = false;
    private isPaused: boolean = false;

    private cycle: { type: 'working' | 'break' | 'longBreak'; duration: number; endMessage: string}[] = [];
    private currentPhaseIndex: number = 0;

    private onTickCallback: ((min: number, sec: number) => void) | null = null;
    private onEndCallback: ((message?: string) => void) | null = null;
    private onStopCallback: (() => void) | null = null;

    constructor() {
        this.cycle = [];
    }

    start(workMin: number = 25, breakMin: number = 5, longBreakMin: number = 15) {
        if (this.isRunning) return;
        this.cycle = [
            { type: 'working', duration: workMin * 60, endMessage: "💪 Great start! Time for a short break." },
            { type: 'break', duration: breakMin * 60, endMessage: "😌 Break’s over. Back to work!" },
            { type: 'working', duration: workMin * 60, endMessage: "👏 Another session down! Time for a long break." },
            { type: 'longBreak', duration: longBreakMin * 60, endMessage: "🌟 You're crushing it! Let's go again." },
            { type: 'working', duration: workMin * 60, endMessage: "Nice job! Take another break." },
            { type: 'break', duration: breakMin * 60, endMessage: "Back to work one last time!" },
            { type: 'working', duration: workMin * 60, endMessage: "🏁 Session complete! Time to rest." }
        ];

        this.currentPhaseIndex = 0;
        this.runPhase(this.cycle[this.currentPhaseIndex]);
    }

    getCurrentPhaseEndMessage(): string {
        return this.cycle[this.currentPhaseIndex].endMessage;
    }
    
    getCurrentTimerText(): string {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        return `🍅 ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - ${this.cycle[this.currentPhaseIndex].type.charAt(0).toUpperCase() + this.cycle[this.currentPhaseIndex].type.slice(1)}`;
    }

    getCurrentCycle(): { type: 'working' | 'break' | 'longBreak'; duration: number; endMessage: string} {
        return this.cycle[this.currentPhaseIndex];
    }

    private runPhase(phase: { type: 'working' | 'break' | 'longBreak'; duration: number }) {
        this.isRunning = true;
        this.currentTime = phase.duration;
        this.interval = setInterval(() => this.tick(), 1000);
    }
    
    stop() {
        if (this.interval) clearInterval(this.interval);
        if (this.onStopCallback) {
            this.onStopCallback();
        }
        this.isRunning = false;
        this.isPaused = false;
        this.interval = null;
        this.currentTime = 0;
        this.currentPhaseIndex = 0;
    }
    
    pause() {
        if (!this.isRunning || this.isPaused) return;
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
        this.isPaused = true;
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.interval = setInterval(() => this.tick(), 1000);
    }

    
    restartSession() {
        if (!this.isRunning) return;
        this.stop();
        this.start();
    }

    onTick(callback: (min: number, sec: number) => void) {
        this.onTickCallback = callback;
    }

    onEnd(callback: (message?: string) => void) {
        this.onEndCallback = callback;
    }

    onStop(callback: () => void) {
        this.onStopCallback = callback;
    }

    private tick() {
        if (this.currentTime <= 0) {
            clearInterval(this.interval!);
            const currentPhase = this.cycle[this.currentPhaseIndex];

            if (this.onEndCallback && currentPhase.endMessage) {
                this.onEndCallback(currentPhase.endMessage);
            }

            this.currentPhaseIndex++;

            if (this.currentPhaseIndex >= this.cycle.length) {
                this.stop(); 
                return;
            }

            this.runPhase(this.cycle[this.currentPhaseIndex]);
        }
    
        this.currentTime--;
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        if (this.onTickCallback) {
            this.onTickCallback(minutes, seconds);
        }
    }
    
}
