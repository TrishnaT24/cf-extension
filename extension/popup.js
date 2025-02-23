

// document.getElementById("sendHandle").addEventListener("click", () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (!tabs[0]?.id) {
//             console.error("No active tab found");
//             return;
//         }

//         chrome.scripting.executeScript({
//             target: { tabId: tabs[0].id },
//             function: extractHandle
//         }).then(result => {
//             console.log("Script execution result:", result);
//         }).catch(err => {
//             console.error("Script execution error:", err);
//         });
//     });
// });

// function extractHandle() {
//     let url = window.location.pathname;
//     let match = url.match(/^\/profile\/(.+)$/);
    
//     if (match) {
//         let handle = match[1];
//         console.log("Extracted handle:", handle);
        
//         // Send message and wait for response
//         chrome.runtime.sendMessage(
//             { action: "sendHandle", handle: handle },
//             response => {
//                 console.log("Background script response:", response);
//                 if (response?.success) {
//                     alert("Recommendations received successfully!");
//                 } else {
//                     alert("Error getting recommendations. Check console for details.");
//                 }
//             }
//         );
//     } else {
//         alert("No handle found! Please go to a Codeforces profile page.");
//     }
// }





document.getElementById("sendHandle").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) {
            console.error("No active tab found");
            return;
        }
        
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
                function extractHandle() {
                    let url = window.location.pathname;
                    let match = url.match(/^\/profile\/(.+)$/);
                    
                    if (match) {
                        return match[1];
                    }
                    
                    let profileLink = document.querySelector("a[href^='/profile/']");
                    if (profileLink) {
                        return profileLink.getAttribute("href").split("/").pop();
                    }
                    
                    return null;
                }

                const handle = extractHandle();
                console.log("Found handle:", handle);
                
                if (handle) {
                    return handle;
                } else {
                    alert("No handle found! Ensure you are logged in.");
                    return null;
                }
            }
        }).then(result => {
            if (result && result[0]?.result) {
                const handle = result[0].result;
                console.log("Extracted handle:", handle);
                
                chrome.runtime.sendMessage(
                    { action: "sendHandle", handle: handle },
                    response => {
                        console.log("Background script response:", response);
                        if (response?.success) {
                            console.log("Received recommendations:", response.data);
                            // Double-check storage to ensure data is there
                            chrome.storage.local.get(['lastRecommendations'], function(result) {
                                console.log("Verified stored recommendations:", result.lastRecommendations);
                            });
                            alert("Recommendations received successfully!");
                        } else {
                            console.error("Error:", response?.error);
                            alert("Error getting recommendations. Check console for details.");
                        }
                    }
                );
            }
        }).catch(err => {
            console.error("Script execution error:", err);
        });
    });
});