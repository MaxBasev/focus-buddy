// Popup script for Focus Buddy extension

document.addEventListener('DOMContentLoaded', function () {
	const toggleButton = document.getElementById('big-toggle');
	const toggleIcon = toggleButton.querySelector('.toggle-icon');
	const statusText = document.getElementById('status-text');
	const manageLink = document.getElementById('manage-link');

	// Load current state from storage
	chrome.storage.sync.get(['isActive'], function (result) {
		// Set toggle button state
		const isActive = result.isActive !== undefined ? result.isActive : true;
		updateToggleState(isActive);
	});

	// Toggle active state when the button is clicked
	toggleButton.addEventListener('click', function () {
		const isActive = !toggleButton.classList.contains('active');
		chrome.storage.sync.set({ isActive: isActive });
		updateToggleState(isActive);

		// Add a little bounce animation on click
		toggleButton.style.transform = 'scale(0.9)';
		setTimeout(() => {
			toggleButton.style.transform = 'scale(1.05)';
			setTimeout(() => {
				toggleButton.style.transform = '';
			}, 150);
		}, 150);
	});

	// Open options page
	manageLink.addEventListener('click', function (e) {
		e.preventDefault();
		chrome.runtime.openOptionsPage();
	});

	// Update toggle state, icon and text
	function updateToggleState(isActive) {
		// Update toggle class
		if (isActive) {
			toggleButton.classList.add('active');
			statusText.classList.add('active');
			toggleIcon.textContent = '🛡️'; // Shield icon
			statusText.textContent = 'Shield Up: Focus Mode';
		} else {
			toggleButton.classList.remove('active');
			statusText.classList.remove('active');
			toggleIcon.textContent = '🍃'; // Leaf/frog icon
			statusText.textContent = 'Zen Mode: Take a Break';
		}
	}
}); 