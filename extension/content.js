
// function findCodeforcesHandle() {
//     // Try multiple selectors to find the handle
//     const selectors = [
//         "a[href^='/profile/']",
//         '.lang-chooser span a',
//         '.rated-user',
//         '#header .username'
//     ];

//     for (let selector of selectors) {
//         const element = document.querySelector(selector);
//         if (element) {
//             return element.innerText.trim();
//         }
//     }
//     return null;
// }

// // Run when DOM is ready
// function init() {
//     console.log("Content script initializing...");
    
//     const handle = findCodeforcesHandle();
//     if (handle) {
//         console.log("Found Codeforces handle:", handle);
        
//         chrome.runtime.sendMessage(
//             { action: "sendHandle", handle: handle },
//             response => {
//                 if (chrome.runtime.lastError) {
//                     console.error("Message sending error:", chrome.runtime.lastError);
//                     return;
//                 }
                
//                 console.log("Background script response:", response);
//                 if (response?.success) {
//                     console.log("Recommendations received successfully");
//                 } else {
//                     console.error("Error getting recommendations:", response?.error);
//                 }
//             }
//         );
//     } else {
//         console.error("Could not find Codeforces handle");
//     }
// }

// // Try both DOMContentLoaded and load events
// document.addEventListener("DOMContentLoaded", init);
// if (document.readyState === "complete") {
//     init();
// }






function findCodeforcesHandle() {
    // First check URL for profile page
    let url = window.location.pathname;
    let match = url.match(/^\/profile\/(.+)$/);
    
    if (match) {
        return match[1];
    }
    
    // Try to find handle from profile link
    let profileLink = document.querySelector("a[href^='/profile/']");
    if (profileLink) {
        return profileLink.getAttribute("href").split("/").pop();
    }
    
    return null;
}

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