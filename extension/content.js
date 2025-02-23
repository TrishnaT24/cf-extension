
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
    let url = window.location.pathname;
    let match = url.match(/^\/profile\/(.+)$/);
    
    if (match) {
        console.log("Found handle from URL:", match[1]); // Log handle from URL
        return match[1];
    }
    
    let profileLink = document.querySelector("a[href^='/profile/']");
    if (profileLink) {
        const handle = profileLink.getAttribute("href").split("/").pop();
        console.log("Found handle from profile link:", handle); // Log handle from link
        return handle;
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
                    // Get and display stored recommendations
                    chrome.storage.local.get(['lastRecommendations'], function(result) {
                        console.log("Stored recommendations:", result.lastRecommendations);
                    });
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

document.addEventListener("DOMContentLoaded", init);
if (document.readyState === "complete") {
    init();
}
