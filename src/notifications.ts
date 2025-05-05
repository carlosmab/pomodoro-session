import * as vscode from 'vscode';

export function showBlockingNotification() {
  vscode.window.showErrorMessage(
    '⏰ Pomodoro ended! Take a break!',
    { modal: true },
    'OK'
  );
}
