import * as vscode from 'vscode';
import { PomodoroSession } from './pomodoroSession';
import { SetupPanel } from './setupPanel';
import { showBlockingNotification } from './notifications';

let timerStatus: vscode.StatusBarItem;
let startButton: vscode.StatusBarItem;

let pomodoroSession: PomodoroSession;

export function activate(context: vscode.ExtensionContext) {
    console.log('Pomodoro Timer extension is now active!');

    timerStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    startButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);

    context.subscriptions.push(timerStatus, startButton);

    pomodoroSession = new PomodoroSession();

    timerStatus.command = 'pomodoro.showMenu';
    startButton.command = 'pomodoro.start';
    startButton.text = 'Start Pomodoro';
    startButton.tooltip = 'Start Pomodoro Timer';
    startButton.show();

    context.subscriptions.push(
        vscode.commands.registerCommand('pomodoro.setup', () => {
            SetupPanel.createOrShow(context.extensionUri);
        }),
        vscode.commands.registerCommand('pomodoro.start', () => {
            startPomodoroSession();
        }),
        vscode.commands.registerCommand('pomodoro.showMenu', async () => {
            const selection = await vscode.window.showQuickPick([
                'Pause',
                'Resume',
                'Stop',
                'Restart',
                'Setup',
            ], { placeHolder: 'Pomodoro Options' });
        
            switch (selection) {
                case 'Pause':
                    pomodoroSession.pause();
                    break;
                case 'Resume':
                    pomodoroSession.resume();
                    break;
                case 'Stop':
                    await stopPomodoroSession();
                    break;
                case 'Restart':
                    await restartPomodoroSession();
                    break;
                case 'Setup':
                    SetupPanel.createOrShow(context.extensionUri);
                    break;
            }
        })
    );

    pomodoroSession.onTick((min, sec) => {
        timerStatus.text = pomodoroSession.getCurrentTimerText();
        startButton.hide();
        timerStatus.show();
    });

    pomodoroSession.onEnd((message) => {
        if (message) {
            showBlockingNotification(message);
        }
    });

    pomodoroSession.onStop(() => {
        timerStatus.hide();
        startButton.show();
        vscode.window.showInformationMessage('Pomodoro session stopped.');
    });
}

function startPomodoroSession() {
    const workMinutes = vscode.workspace.getConfiguration('pomodoro').get('workDuration', 25); 
    const shortBreakMinutes = vscode.workspace.getConfiguration('pomodoro').get('shortBreakDuration', 5);
    const longBreakMinutes = vscode.workspace.getConfiguration('pomodoro').get('longBreakDuration', 15);

    pomodoroSession.start(workMinutes, shortBreakMinutes, longBreakMinutes);
    timerStatus.text = `⏱️ Starting Pomodoro...`;
    startButton.hide();
}

async function stopPomodoroSession() {
    const confirmation = await vscode.window.showInformationMessage(
        'Are you sure you want to stop the Pomodoro timer?',
        'Yes', 'No'
    );

    if (confirmation === 'Yes') {
        pomodoroSession.stop();
        vscode.window.showInformationMessage('Pomodoro timer stopped.');
        timerStatus.hide();
        startButton.show();
    }
}

async function restartPomodoroSession() {
    const confirmation = await vscode.window.showInformationMessage(
        'Are you sure you want restart the Pomodoro Session?',
        'Yes', 'No'
    );

    if (confirmation === 'Yes') {
        pomodoroSession.restartSession();
        vscode.window.showInformationMessage('Pomodoro Session restarted.');
    }
}

