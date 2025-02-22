
function findCodeforcesHandle() {
    // Try multiple selectors to find the handle
    const selectors = [
        "a[href^='/profile/']",
        '.lang-chooser span a',
        '.rated-user',
        '#header .username'
    ];

    for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.innerText.trim();
        }
    }
    return null;
}

// Run when DOM is ready
function init() {
    console.log("Content script initializing...");
    
    const handle = findCodeforcesHandle();
    if (handle) {
        console.log("Found Codeforces handle:", handle);
        
        chrome.runtime.sendMessage(
            { action: "sendHandle", handle: handle },
            response => {
                if (chrome.runtime.lastError) {
                    console.error("Message sending error:", chrome.runtime.lastError);
                    return;
                }
                
                console.log("Background script response:", response);
                if (response?.success) {
                    console.log("Recommendations received successfully");
                } else {
                    console.error("Error getting recommendations:", response?.error);
                }
            }
        );
    } else {
        console.error("Could not find Codeforces handle");
    }
}

// Try both DOMContentLoaded and load events
document.addEventListener("DOMContentLoaded", init);
if (document.readyState === "complete") {
    init();
}