/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Simple function to wait for document to be loaded
function onceDocumentLoaded(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

const vscode = acquireVsCodeApi();

function getSettings() {
    const element = document.getElementById('simple-browser-settings');
    if (element) {
        const data = element.getAttribute('data-settings');
        if (data) {
            return JSON.parse(data);
        }
    }

    throw new Error(`Could not load settings`);
}

const settings = getSettings();

const iframe = document.querySelector('iframe');
const header = document.querySelector('.header');
const input = header.querySelector('.url-input');
const forwardButton = header.querySelector('.forward-button');
const backButton = header.querySelector('.back-button');
const reloadButton = header.querySelector('.reload-button');
const openExternalButton = header.querySelector('.open-external-button');

// Debug logging
console.log('DOM elements:', { iframe, header, input, forwardButton, backButton, reloadButton, openExternalButton });
console.log('Initial settings:', settings);

window.addEventListener('message', e => {
    console.log('Received message:', e.data);
    switch (e.data.type) {
        case 'focus':
            {
                iframe.focus();
                break;
            }
        case 'didChangeFocusLockIndicatorEnabled':
            {
                toggleFocusLockIndicatorEnabled(e.data.focusLockEnabled);
                break;
            }
    }
});

onceDocumentLoaded(() => {
    console.log('Document loaded');
    
    setInterval(() => {
        const iframeFocused = document.activeElement?.tagName === 'IFRAME';
        document.body.classList.toggle('iframe-focused', iframeFocused);
    }, 50);

    iframe.addEventListener('load', () => {
        console.log('Iframe loaded:', iframe.src);
    });

    iframe.addEventListener('error', (e) => {
        console.error('Iframe error:', e);
    });

    input.addEventListener('change', e => {
        const url = e.target.value;
        console.log('URL input changed:', url);
        navigateTo(url);
    });

    forwardButton.addEventListener('click', () => {
        console.log('Forward button clicked');
        history.forward();
    });

    backButton.addEventListener('click', () => {
        console.log('Back button clicked');
        history.back();
    });

    openExternalButton.addEventListener('click', () => {
        console.log('Open external button clicked');
        vscode.postMessage({
            type: 'openExternal',
            url: input.value
        });
    });

    reloadButton.addEventListener('click', () => {
        console.log('Reload button clicked');
        navigateTo(input.value);
    });

    // Make sure the URL is properly formatted
    let initialUrl = settings.url;
    if (initialUrl && !initialUrl.startsWith('http://') && !initialUrl.startsWith('https://')) {
        initialUrl = 'https://' + initialUrl;
    }

    console.log('Initial navigation to:', initialUrl);
    navigateTo(initialUrl || 'https://example.com');
    input.value = initialUrl || 'https://example.com';

    toggleFocusLockIndicatorEnabled(settings.focusLockEnabled);

    function navigateTo(rawUrl) {
        console.log('Navigating to raw URL:', rawUrl);
        
        // Ensure URL has a protocol
        let processedUrl = rawUrl;
        if (processedUrl && !processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
            console.log('Added https protocol:', processedUrl);
        }
        
        try {
            const url = new URL(processedUrl);

            // Try to bust the cache for the iframe
            url.searchParams.append('vscodeBrowserReqId', Date.now().toString());

            console.log('Setting iframe.src to:', url.toString());
            iframe.src = url.toString();
            
            // Store the URL in VS Code state
            vscode.setState({ url: processedUrl });
        } catch (e) {
            console.error('Navigation error:', e);
            
            // Fallback for invalid URLs
            console.log('Falling back to direct assignment for:', processedUrl);
            iframe.src = processedUrl;
            vscode.setState({ url: processedUrl });
        }
    }
});

function toggleFocusLockIndicatorEnabled(enabled) {
    console.log('Toggle focus lock indicator:', enabled);
    document.body.classList.toggle('enable-focus-lock-indicator', enabled);
}
