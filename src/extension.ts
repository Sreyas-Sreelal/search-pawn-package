'use strict';

import * as vscode from 'vscode';
import axios from 'axios';

type Package = {
	user: string;
	repo: string;
	classification: string;
};

var packages:Package[];

const GetCompletionItem = (Range: vscode.Range) => (pack: Package) => {

	const { user, repo , classification } = pack;
	const content = new vscode.CompletionItem(user+"/"+repo, vscode.CompletionItemKind.Text);
	content.additionalTextEdits = [vscode.TextEdit.delete(Range)];
	content.insertText = `"${user}/${repo}"`;
	return content;
};

async function GetPackagelist() {
	try {
		let response =  await axios.get("https://api.sampctl.com/");
		packages = response.data.filter((item:Package) => item.classification === "full");
	} catch(err) {
		console.error(err);
		vscode.window.showErrorMessage("Couldn't connect to https://api.sampctl.com/");
	}

}

export function activate(context: vscode.ExtensionContext) {
	//vscode.window.showInformationMessage('Activated search pawn package!');
	console.log('search-pawn-package is activated');
	GetPackagelist();

	vscode.languages.registerCompletionItemProvider({ language: 'json', pattern: '**/pawn.json' }, {
		async provideCompletionItems (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			
			const editor = vscode.window.activeTextEditor;
			const posline = editor.selection.active;
			const { text } = document.lineAt(posline);
			const currentLineReplaceRange = new vscode.Range(new vscode.Position(posline.line, position.character), new vscode.Position(posline.line, text.length));
			
			if(packages !== undefined) {
				return packages.map(GetCompletionItem(currentLineReplaceRange));
			}
		},
		resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken) {
			return item;
		}
			
	});

}

export function deactivate() {}