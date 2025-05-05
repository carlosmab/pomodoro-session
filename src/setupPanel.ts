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
                if (message.command === 'saveConfig') {
                    const { work, short, long } = message.data;

                    // Save the user preferences in settings.json
                    vscode.workspace.getConfiguration().update('pomodoro.workDuration', parseInt(work), vscode.ConfigurationTarget.Global);
                    vscode.workspace.getConfiguration().update('pomodoro.shortBreakDuration', parseInt(short), vscode.ConfigurationTarget.Global);
                    vscode.workspace.getConfiguration().update('pomodoro.longBreakDuration', parseInt(long), vscode.ConfigurationTarget.Global);

                    // Notify the user that settings were saved
                    vscode.window.showInformationMessage('Pomodoro Timer settings saved.');
                    this.dispose();  // Close the setup panel
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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        padding: 20px;
                        background-color: #f4f7fc;
                        color: #333;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                    }
    
                    h2 {
                        color: rgb(163, 55, 73);
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
    
                    label {
                        font-size: 16px;
                        margin-bottom: 8px;
                        display: block;
                        color: #555;
                        font-weight: 600;
                    }
    
                    input {
                        padding: 8px;
                        font-size: 16px;
                        width: 60%;
                        margin-bottom: 15px;
                        border: 2px solid #ddd;
                        text-align: right;
                        border-radius: 4px;
                        transition: border-color 0.3s;
                    }
    
                    input:focus {
                        border-color:rgb(163, 55, 73);
                        outline: none;
                    }
    
                    button {
                        padding: 10px 20px;
                        font-size: 16px;
                        background-color: rgb(163, 55, 73);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: background-color 0.3s;
                    }
    
                    button:hover {
                        background-color: rgb(163, 55, 73);
                    }
    
                    .container {
                        text-align: center;
                        width: 100%;
                        max-width: 400px;
                    }
    
                    .input-container {
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Pomodoro Timer Setup</h2>
    
                    <div class="input-container">
                        <label for="work">Work Duration (minutes):</label>
                        <input type="number" id="work" value="25" min="5" max="60" step="5"/>
                    </div>
    
                    <div class="input-container">
                        <label for="short">Short Break Duration (minutes):</label>
                        <input type="number" id="short" value="5" min="5" max="30" step="5"/>
                    </div>
    
                    <div class="input-container">
                        <label for="long">Long Break Duration (minutes):</label>
                        <input type="number" id="long" value="15" min="10" max="60" step="5"/>
                    </div>
    
                    <button onclick="submit()">Save Config</button>
                </div>
    
                <script>
                    const vscode = acquireVsCodeApi();
                    function submit() {
                        const data = {
                            work: document.getElementById('work').value,
                            short: document.getElementById('short').value,
                            long: document.getElementById('long').value
                        };
                        vscode.postMessage({ command: 'saveConfig', data });
                    }
                </script>
            </body>
            </html>
        `;
    }
}
