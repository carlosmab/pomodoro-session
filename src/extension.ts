import * as vscode from 'vscode';
import { PomodoroTimer } from './timerStatus';
import { SetupPanel } from './setupPanel';
import { showBlockingNotification } from './notifications';

let statusBarItem: vscode.StatusBarItem;
let stopButton: vscode.StatusBarItem;
let timer: PomodoroTimer;


export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  stopButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);  // For Stop button
  timer = new PomodoroTimer();

  // Show the stop button and hide it when timer ends
  stopButton.command = 'pomodoro.stop';  // Register stop command

  context.subscriptions.push(
    vscode.commands.registerCommand('pomodoro.start', () => {
      SetupPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('pomodoro.stop', () => {
      stopPomodoroTimer();  // Call the stop function
    })
  );

  vscode.window.registerWebviewPanelSerializer('pomodoroSetup', {
    async deserializeWebviewPanel(panel: vscode.WebviewPanel, state: any) {
      SetupPanel.revive(panel, context.extensionUri);
    }
  });

  // Timer callbacks
  timer.onTick((min, sec) => {
    statusBarItem.text = `⏱️ ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    statusBarItem.show();
    stopButton.show();  // Show stop button when timer is running
  });

  timer.onEnd(() => {
    statusBarItem.hide();
    stopButton.hide();  // Hide stop button when timer ends
    showBlockingNotification();
  });
}

export function startPomodoroWithSettings(work: number) {
  timer.start(work);
}

// New function to stop the Pomodoro timer
function stopPomodoroTimer() {
  timer.stop();
  statusBarItem.hide();
  stopButton.hide();
  vscode.window.showInformationMessage('Pomodoro timer stopped.');
}
