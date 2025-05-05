import * as vscode from 'vscode';

export function showBlockingNotification(message: string) {
  vscode.window.showErrorMessage(
    message,
    { modal: true },
    'OK'
  );
}
