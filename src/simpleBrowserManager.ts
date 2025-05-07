/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { ShowOptions, SimpleBrowserView } from './simpleBrowserView';

export class SimpleBrowserManager {

	private _views: Set<SimpleBrowserView> = new Set();

	constructor(
		private readonly extensionUri: vscode.Uri,
	) { }

	dispose() {
		for (const view of this._views) {
			view.dispose();
		}
		this._views.clear();
	}

	public show(inputUri: string | vscode.Uri, options?: ShowOptions): void {
		const url = typeof inputUri === 'string' ? inputUri : inputUri.toString(true);
		
		// Always create a new view
		const view = SimpleBrowserView.create(this.extensionUri, url, options);
		this.registerWebviewListeners(view);
		this._views.add(view);
	}

	public restore(panel: vscode.WebviewPanel, state: any): void {
		const url = state?.url ?? '';
		const view = SimpleBrowserView.restore(this.extensionUri, url, panel);
		this.registerWebviewListeners(view);
		this._views.add(view);
	}

	private registerWebviewListeners(view: SimpleBrowserView) {
		view.onDispose(() => {
			this._views.delete(view);
		});
	}
}
