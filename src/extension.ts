/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { SimpleBrowserManager } from './simpleBrowserManager';
import { SimpleBrowserView } from './simpleBrowserView';

// Use the built-in URL API

// Original Simple Browser commands
const originalOpenApiCommand = 'simpleBrowser.api.open';
const originalShowCommand = 'simpleBrowser.show';

// Simple Browser Multi commands
const openApiCommand = 'simpleBrowserMulti.api.open';
const showCommand = 'simpleBrowserMulti.show';

const enabledHosts = new Set<string>([
	'localhost',
	// localhost IPv4
	'127.0.0.1',
	// localhost IPv6
	'[0:0:0:0:0:0:0:1]',
	'[::1]',
	// all interfaces IPv4
	'0.0.0.0',
	// all interfaces IPv6
	'[0:0:0:0:0:0:0:0]',
	'[::]'
]);

const openerId = 'simpleBrowser.open';

// Define ExternalUriOpenerPriority enum if it doesn't exist in the vscode namespace
enum ExternalUriOpenerPriority {
	None = 0,
	Option = 1,
	Default = 2,
}

export function activate(context: vscode.ExtensionContext) {

	const manager = new SimpleBrowserManager(context.extensionUri);
	context.subscriptions.push(manager);

	context.subscriptions.push(vscode.window.registerWebviewPanelSerializer(SimpleBrowserView.viewType, {
		deserializeWebviewPanel: async (panel, state) => {
			manager.restore(panel, state);
		}
	}));

		// Register Simple Browser Multi commands
	context.subscriptions.push(vscode.commands.registerCommand(showCommand, async (url?: string) => {
		if (!url) {
			url = await vscode.window.showInputBox({
				placeHolder: vscode.l10n.t("https://example.com"),
				prompt: vscode.l10n.t("Enter url to visit")
			});
		}

		if (url) {
			manager.show(url);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand(openApiCommand, (url: vscode.Uri, showOptions?: {
		preserveFocus?: boolean;
		viewColumn: vscode.ViewColumn;
	}) => {
		manager.show(url, showOptions);
	}));

	// Register original Simple Browser commands to handle them with this extension
	context.subscriptions.push(vscode.commands.registerCommand(originalShowCommand, async (url?: string) => {
		if (!url) {
			url = await vscode.window.showInputBox({
				placeHolder: vscode.l10n.t("https://example.com"),
				prompt: vscode.l10n.t("Enter url to visit")
			});
		}

		if (url) {
			manager.show(url);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand(originalOpenApiCommand, (url: vscode.Uri, showOptions?: {
		preserveFocus?: boolean;
		viewColumn: vscode.ViewColumn;
	}) => {
		manager.show(url, showOptions);
	}));

	// Only register the external URI opener if the API is available
	if ('registerExternalUriOpener' in vscode.window) {
		context.subscriptions.push((vscode.window as any).registerExternalUriOpener(openerId, {
			canOpenExternalUri(uri: vscode.Uri) {
				// We have to replace the IPv6 hosts with IPv4 because URL can't handle IPv6.
				const originalUri = new URL(uri.toString(true));
				if (enabledHosts.has(originalUri.hostname)) {
					return isWeb()
						? ExternalUriOpenerPriority.Default
						: ExternalUriOpenerPriority.Option;
				}

				return ExternalUriOpenerPriority.None;
			},
			openExternalUri(resolveUri: vscode.Uri) {
				return manager.show(resolveUri, {
					viewColumn: vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active
				});
			}
		}, {
			schemes: ['http', 'https'],
			label: vscode.l10n.t("Open in simple browser"),
		}));
	}
}

function isWeb(): boolean {
	return typeof navigator !== 'undefined' && vscode.env.uiKind === vscode.UIKind.Web;
}
