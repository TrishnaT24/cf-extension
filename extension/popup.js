// document.getElementById("sendHandle").addEventListener("click", () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.scripting.executeScript({
//             target: { tabId: tabs[0].id },
//             function: extractHandle
//         });
//     });
// });

// function extractHandle() {
//     let url = window.location.pathname; // Get the current page path
//     let match = url.match(/^\/profile\/(.+)$/); // Extract handle using regex

//     if (match) {
//         let handle = match[1]; // Extracted handle
//         console.log("handle is ",handle);
//         chrome.runtime.sendMessage({ action: "sendHandle", handle: handle });
//     } else {
//         alert("No handle found! Please log in to Codeforces.");
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
            function: extractHandle
        }).then(result => {
            console.log("Script execution result:", result);
        }).catch(err => {
            console.error("Script execution error:", err);
        });
    });
});

function extractHandle() {
    let url = window.location.pathname;
    let match = url.match(/^\/profile\/(.+)$/);

    if (match) {
        let handle = match[1];
        console.log("Extracted handle:", handle);
        
        // Send message and wait for response
        chrome.runtime.sendMessage(
            { action: "sendHandle", handle: handle },
            response => {
                console.log("Background script response:", response);
                if (response?.success) {
                    alert("Recommendations received successfully!");
                } else {
                    alert("Error getting recommendations. Check console for details.");
                }
            }
        );
    } else {
        alert("No handle found! Please go to a Codeforces profile page.");
    }
}