import * as vscode from 'vscode';

export class SetupPanel {
    public static currentPanel: SetupPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.ViewColumn.One;

        if (SetupPanel.currentPanel) {
            SetupPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'pomodoroSetup',
            'Pomodoro Setup',
            column,
            {
                enableScripts: true
            }
        );

        SetupPanel.currentPanel = new SetupPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._panel.webview.html = this._getHtmlForWebview();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                if (message.command === 'start') {
                    const { work } = message.data;
                    vscode.commands.executeCommand('pomodoro.internalStartTimer', work);
                    this.dispose();
                }
            },
            null,
            this._disposables
        );
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        SetupPanel.currentPanel = new SetupPanel(panel, extensionUri);
    }

    public dispose() {
        SetupPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) x.dispose();
        }
    }

    private _getHtmlForWebview() {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: sans-serif; padding: 20px; }
          label, input { display: block; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h2>Pomodoro Timer Setup</h2>
        <label>Work Duration (minutes):
          <input type="number" id="work" value="25" min="5" max="60" step="5"/>
        </label>
        <label>Short Break:
          <input type="number" id="short" value="5" min="5" max="30" step="5"/>
        </label>
        <label>Long Break:
          <input type="number" id="long" value="15" min="10" max="60" step="5"/>
        </label>
        <button onclick="submit()">Start Session</button>
        <script>
          const vscode = acquireVsCodeApi();
          function submit() {
            const data = {
              work: document.getElementById('work').value,
              short: document.getElementById('short').value,
              long: document.getElementById('long').value
            };
            vscode.postMessage({ command: 'start', data });
          }
        </script>
      </body>
      </html>
    `;
    }

}
