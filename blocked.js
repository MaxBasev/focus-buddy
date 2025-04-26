// Script for blocked.html page

// Temporarily stored URL
let originalUrl = '';

// Get original URL from parameters
window.addEventListener('DOMContentLoaded', function () {
	const urlParams = new URLSearchParams(window.location.search);
	originalUrl = urlParams.get('originalUrl');
});

// Temporary allow access
document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('temporary-allow').addEventListener('click', function () {
		// Send message to background script
		chrome.runtime.sendMessage({
			action: 'temporaryAllow',
			url: originalUrl
		}, function (response) {
			if (response && response.success) {
				// If successful, navigate back to the blocked site
				if (originalUrl) {
					window.location.href = originalUrl;
				} else {
					window.history.back();
				}
			}
		});
	});
}); 