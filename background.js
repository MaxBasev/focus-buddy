// Background script for Focus Buddy extension

// Default state is active (blocking enabled)
const defaultState = {
	isActive: true,
	blockedSites: ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com']
};

// Store for sites temporarily allowed
const temporaryAllowed = {
	sites: new Set(),
	timers: {}
};

// Initialize extension state from storage or use defaults
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.get(['isActive', 'blockedSites'], (result) => {
		if (Object.keys(result).length === 0) {
			chrome.storage.sync.set(defaultState);
		}
		updateIcon(result.isActive !== undefined ? result.isActive : defaultState.isActive);
	});
});

// Listen for changes in extension state
chrome.storage.onChanged.addListener((changes) => {
	if (changes.isActive) {
		updateIcon(changes.isActive.newValue);
	}
});

// Update the extension icon based on active state
function updateIcon(isActive) {
	const iconPath = isActive ?
		{
			16: 'icons/icon-16.png',
			48: 'icons/icon-48.png',
			128: 'icons/icon-128.png'
		} :
		{
			16: 'icons/icon-16_disabled.png',
			48: 'icons/icon-48_disabled.png',
			128: 'icons/icon-128_disabled.png'
		};

	chrome.action.setIcon({ path: iconPath });
}

// Check if URL is in the blocked list
function isBlockedSite(url, blockedSites) {
	const hostname = new URL(url).hostname;
	// Check if site is temporarily allowed
	if (temporaryAllowed.sites.has(hostname)) {
		return false;
	}
	return blockedSites.some(site => hostname.includes(site));
}

// Listen for web navigation and block if needed
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
	// Only process main frame navigation (not iframes, etc)
	if (details.frameId !== 0) return;

	chrome.storage.sync.get(['isActive', 'blockedSites'], (result) => {
		const isActive = result.isActive !== undefined ? result.isActive : defaultState.isActive;
		const blockedSites = result.blockedSites || defaultState.blockedSites;

		if (isActive && isBlockedSite(details.url, blockedSites)) {
			// Pass the original URL as a parameter
			const blockPageUrl = chrome.runtime.getURL('blocked.html') +
				'?originalUrl=' + encodeURIComponent(details.url);

			chrome.tabs.update(details.tabId, {
				url: blockPageUrl
			});
		}
	});
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'temporaryAllow') {
		// Use URL from the message if available, otherwise from the sender tab
		const url = message.url || sender.tab?.url;
		const success = handleTemporaryAllow(url);
		sendResponse({ success: success });
	}

	return true; // Keep the message channel open for async response
});

// Handle temporary allowing of a blocked site
function handleTemporaryAllow(url) {
	if (!url) return false;

	try {
		const hostname = new URL(url).hostname;

		// Add to temporarily allowed sites
		temporaryAllowed.sites.add(hostname);

		// Clear any existing timer
		if (temporaryAllowed.timers[hostname]) {
			clearTimeout(temporaryAllowed.timers[hostname]);
		}

		// Set timer to remove from allowed list after 5 minutes
		temporaryAllowed.timers[hostname] = setTimeout(() => {
			temporaryAllowed.sites.delete(hostname);
			delete temporaryAllowed.timers[hostname];
		}, 5 * 60 * 1000); // 5 minutes

		return true;
	} catch (e) {
		console.error('Error handling temporary allow:', e);
		return false;
	}
} 