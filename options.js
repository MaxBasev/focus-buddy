// Options script for Focus Buddy extension

document.addEventListener('DOMContentLoaded', function () {
	// DOM elements
	const toggleSwitch = document.getElementById('toggle-switch');
	const statusText = document.getElementById('status-text');
	const sitesCount = document.getElementById('sites-count');
	const siteInput = document.getElementById('site-input');
	const addSiteBtn = document.getElementById('add-site-btn');
	const sitesList = document.getElementById('sites-list');
	const noSitesMessage = document.getElementById('no-sites-message');
	const clearAllBtn = document.getElementById('clear-all-btn');
	const saveBtn = document.getElementById('save-btn');

	// Create notification for unsaved changes
	const saveNotification = document.createElement('div');
	saveNotification.className = 'save-notification';
	saveNotification.textContent = 'Don\'t forget to save your changes!';
	saveNotification.style.display = 'none';
	document.querySelector('.card').appendChild(saveNotification);

	// Local state
	let blockedSites = [];
	let isActive = true;
	let hasChanges = false;

	// Load settings from storage
	loadSettings();

	// Toggle blocking state
	toggleSwitch.addEventListener('change', function () {
		isActive = toggleSwitch.checked;
		updateStatusText();
		setHasChanges(true);
	});

	// Add new site
	addSiteBtn.addEventListener('click', function () {
		addSite();
	});

	// Add site on Enter key
	siteInput.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') {
			addSite();
		}
	});

	// Clear all sites
	clearAllBtn.addEventListener('click', function () {
		if (confirm('Are you sure you want to clear all blocked sites?')) {
			blockedSites = [];
			renderSitesList();
			setHasChanges(true);
		}
	});

	// Save changes
	saveBtn.addEventListener('click', function () {
		saveSettings();
	});

	// Load settings from storage
	function loadSettings() {
		chrome.storage.sync.get(['isActive', 'blockedSites'], function (result) {
			isActive = result.isActive !== undefined ? result.isActive : true;
			blockedSites = result.blockedSites || [];

			// Update UI
			toggleSwitch.checked = isActive;
			updateStatusText();
			renderSitesList();

			// Reset changes flag on load
			setHasChanges(false);
		});
	}

	// Save settings to storage
	function saveSettings() {
		chrome.storage.sync.set({
			isActive: isActive,
			blockedSites: blockedSites
		}, function () {
			// Show save confirmation
			saveBtn.textContent = 'Saved!';
			saveBtn.style.backgroundColor = '#059669';

			setTimeout(function () {
				saveBtn.textContent = 'Save Changes';
				saveBtn.style.backgroundColor = '#2563eb';
			}, 1500);

			setHasChanges(false);
		});
	}

	// Add a new site to the blocked list
	function addSite() {
		const site = sanitizeSite(siteInput.value);

		if (site && !blockedSites.includes(site)) {
			blockedSites.push(site);
			renderSitesList();
			siteInput.value = '';
			setHasChanges(true);
		} else if (blockedSites.includes(site)) {
			alert('This site is already in your blocked list.');
		}
	}

	// Remove a site from the blocked list
	function removeSite(site) {
		blockedSites = blockedSites.filter(s => s !== site);
		renderSitesList();
		setHasChanges(true);
	}

	// Set changes state and update UI
	function setHasChanges(value) {
		hasChanges = value;

		// Show/hide notification
		saveNotification.style.display = hasChanges ? 'block' : 'none';

		// Highlight save button if there are changes
		if (hasChanges) {
			saveBtn.style.animation = 'pulse 1.5s infinite';
		} else {
			saveBtn.style.animation = 'none';
		}
	}

	// Render the list of blocked sites
	function renderSitesList() {
		sitesList.innerHTML = '';
		sitesCount.textContent = blockedSites.length;

		if (blockedSites.length === 0) {
			noSitesMessage.style.display = 'block';
			return;
		}

		noSitesMessage.style.display = 'none';

		blockedSites.forEach(site => {
			const li = document.createElement('li');
			li.className = 'site-item';

			const siteText = document.createElement('span');
			siteText.textContent = site;

			const removeBtn = document.createElement('button');
			removeBtn.innerHTML = '&times;';
			removeBtn.className = 'remove-btn';
			removeBtn.addEventListener('click', function () {
				removeSite(site);
			});

			li.appendChild(siteText);
			li.appendChild(removeBtn);
			sitesList.appendChild(li);
		});
	}

	// Clean and format the site input
	function sanitizeSite(input) {
		if (!input.trim()) return '';

		// Remove http(s):// and www. prefixes
		let site = input.trim().toLowerCase();
		site = site.replace(/^(https?:\/\/)?(www\.)?/i, '');

		// Remove anything after the first slash if present
		site = site.split('/')[0];

		return site;
	}

	// Update the status text based on the active state
	function updateStatusText() {
		statusText.textContent = isActive ? 'Active' : 'Inactive';
		statusText.className = isActive ? 'mr-2 text-green' : 'mr-2 text-gray';
	}

	// Warn before leaving with unsaved changes
	window.addEventListener('beforeunload', function (e) {
		if (hasChanges) {
			e.preventDefault();
			e.returnValue = '';
			return '';
		}
	});
}); 