import * as assert from 'assert';
import { PomodoroSession } from '../src/pomodoroSession';

let session: PomodoroSession;

beforeEach(() => {
    session = new PomodoroSession();  // Fresh session before each test
});

afterEach(() => {
    session.stop(); // Ensure session is stopped to avoid conflicts
});


describe('PomodoroSession tests', () => {

    it('Should start the cycle', () => {
        session.start(1, 1, 1);
        const current = session.getCurrentCycle();
        assert.strictEqual(current.type, 'working');
    });

    it('Should switch to break after first work phase', function(done)  {
        this.timeout(5000);
        session.onEnd(() => {
            setTimeout(() => {
                const current = session.getCurrentCycle();
                assert.strictEqual(current.type, 'break');
                done();
            }, 50); 
        });
        session.start(0.01, 0.01, 0.01);
    });

    it('Should run through all phases', function(done) {
        this.timeout(10000);
        let transitions = 0;
        session.onEnd(() => {
            transitions++;
            if (transitions === 6) { // 4 work + 2 break + 1 long break
                assert.ok(true);
                done();
            }
        });
        session.start(0.01, 0.01, 0.01);
    });

    it('Pause and resume works correctly', function(done) {
        this.timeout(10000);
        
        let tickCount = 0;

        session.onTick(() => {
            tickCount++;
            if (tickCount === 1) {
                session.pause();
                const beforePause = tickCount;
                setTimeout(() => {
                    assert.strictEqual(tickCount, beforePause); // No ticks during pause
                    session.resume();
                    setTimeout(() => {
                        assert.ok(tickCount > beforePause); // Should resume ticking
                        done();
                    }, 1000);
                }, 1000);
            }
        });

        session.start(0.02, 1, 1);
    });

    it('Stop clears the interval', () => {
        session.start(1, 1, 1);
        session.stop();
        assert.strictEqual((session as any).interval, null);
    });

});
