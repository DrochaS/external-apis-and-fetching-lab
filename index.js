// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area="

// Your code here!

// DOM Elements
const stateInput = document.getElementById('stateInput');
const fetchBtn = document.getElementById('fetchAlertsBtn');
const errorDiv = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading-indicator');
const alertsContainer = document.getElementById('alerts-container');
const alertsDisplay = document.getElementById('alerts-display');

// Helper function to validate state abbreviation
function isValidStateAbbreviation(state) {
    // State abbreviations are exactly 2 uppercase letters
    const stateRegex = /^[A-Z]{2}$/;
    return stateRegex.test(state);
}

// Helper function to hide error and clear its content
function hideError() {
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
}

// Helper function to show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Helper function to show loading indicator
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

// Helper function to hide loading indicator
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Helper function to clear input field
function clearInput() {
    stateInput.value = '';
}

// Function to display alerts on the page
function displayAlerts(data, stateAbbr) {
    // Clear previous alerts
    alertsDisplay.innerHTML = '';
    
    const titleText = data.title ? `${data.title}: ${data.features ? data.features.length : 0}` : `Current watches, warnings, and advisories for ${stateAbbr}: ${data.features ? data.features.length : 0}`;
    
    // Get the state name from the first alert or use abbreviation
    let stateName = stateAbbr;
    if (data.features && data.features.length > 0 && data.features[0].properties.areaDesc) {
        const areaDesc = data.features[0].properties.areaDesc;
        // Try to extract state name from area description
        const stateMatch = areaDesc.match(/\b([A-Z][a-z]+)\b/);
        if (stateMatch) {
            stateName = stateMatch[0];
        }
    }
    
    // Get number of alerts
    const alertCount = data.features ? data.features.length : 0;
    
    // Create summary message
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary';
    summaryDiv.innerHTML = `
        <h2>📋 ${titleText}</h2>
        <p>${alertCount === 0 ? 'No active alerts at this time.' : 'Click on any alert for more details.'}</p>
    `;
    alertsDisplay.appendChild(summaryDiv);
    
    // If there are alerts, create the list
    if (alertCount > 0) {
        const alertsList = document.createElement('ul');
        alertsList.className = 'alerts-list';
        
        // Loop through each alert and add headline
        data.features.forEach((alert, index) => {
            const headline = alert.properties.headline;
            const severity = alert.properties.severity || 'Unknown';
            const urgency = alert.properties.urgency || 'Unknown';
            
            const alertItem = document.createElement('li');
            alertItem.className = 'alert-item';
            
            // Add severity badge if available
            let severityBadge = '';
            if (severity !== 'Unknown') {
                const severityClass = severity.toLowerCase();
                severityBadge = `<span class="severity-badge ${severityClass}">${severity}</span>`;
            }
            
            alertItem.innerHTML = `
                <div class="alert-headline">
                    ${severityBadge}
                    ${headline || `Alert #${index + 1}`}
                </div>
                <div style="font-size:0.85rem; color:#666; margin-top:8px;">
                    Urgency: ${urgency}
                </div>
            `;
            
            // Add click event to show more details
            alertItem.addEventListener('click', () => {
                showAlertDetails(alert);
            });
            
            alertsList.appendChild(alertItem);
        });
        
        alertsDisplay.appendChild(alertsList);
    } else {
        // Show no alerts message
        const noAlertsDiv = document.createElement('div');
        noAlertsDiv.className = 'no-alerts';
        noAlertsDiv.innerHTML = '✅ No active weather alerts for this state. Stay safe!';
        alertsDisplay.appendChild(noAlertsDiv);
    }
}

// Optional: Function to show detailed alert information in a modal or alert
function showAlertDetails(alert) {
    const properties = alert.properties;
    const details = `
        Headline: ${properties.headline || 'N/A'}
        Description: ${properties.description || 'N/A'}
        Severity: ${properties.severity || 'N/A'}
        Urgency: ${properties.urgency || 'N/A'}
        Areas: ${properties.areaDesc || 'N/A'}
        Sent: ${new Date(properties.sent).toLocaleString() || 'N/A'}
    `;
    alert(details);
}

// Main function to fetch weather alerts
async function fetchWeatherAlerts(state) {
    // Hide any previous error
    hideError();
    
    // Clear input field
    clearInput();
    
    // Show loading indicator
    showLoading();
    
    try {
        // Validate input: must be exactly 2 capital letters
        if (!state || state.length !== 2) {
            throw new Error('Please enter a valid 2-letter state abbreviation (e.g., CA, TX, NY)');
        }
        
        const upperState = state.toUpperCase();
        
        if (!isValidStateAbbreviation(upperState)) {
            throw new Error('Please enter only letters (A-Z) for state abbreviation');
        }
        
        // Make the API request
        const url = `${weatherApi}${upperState}`;
        console.log(`Fetching weather alerts for ${upperState}...`);
        
        const response = await fetch(url);
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Log data to console for testing
        console.log('Weather Alerts Data:', data);
        console.log(`Number of alerts found: ${data.features ? data.features.length : 0}`);
        
        // Display alerts on the page
        displayAlerts(data, upperState);
        
    } catch (error) {
        // Handle errors gracefully
        console.error('Error fetching weather alerts:', error.message);
        showError(`❌ ${error.message}`);
        
        // Clear any existing alerts
        alertsDisplay.innerHTML = '';
        
    } finally {
        // Always hide loading indicator
        hideLoading();
    }
}

// Event listener for the fetch button
fetchBtn.addEventListener('click', () => {
    const state = stateInput.value.trim();
    fetchWeatherAlerts(state);
});

// Optional: Allow Enter key to submit
stateInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const state = stateInput.value.trim();
        fetchWeatherAlerts(state);
    }
});

// Optional: Auto-uppercase as user types
stateInput.addEventListener('input', (event) => {
    event.target.value = event.target.value.toUpperCase();
});

// Console log to confirm script is loaded
console.log('Weather Alerts app loaded! Ready to fetch alerts.');
