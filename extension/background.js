// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log("Background script received message:", message);

//     if (message.action === "sendHandle") {
//         let userHandle = message.handle;
//         console.log("Processing handle:", userHandle);

//         // Make the API request
//         fetch("https://trishna.pythonanywhere.com/api/process_handle", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Accept": "application/json"
//             },
//             body: JSON.stringify({ handle: userHandle })
//         })
//         .then(response => {
//             console.log("API Response status:", response.status);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log("API Response data:", data);
//             if (!data.recommendations || data.recommendations.length === 0) {
//                 throw new Error("No recommendations received");
//             }
            
//             // Store recommendations in chrome.storage
//             chrome.storage.local.set({ 
//                 'lastRecommendations': data.recommendations,
//                 'timestamp': Date.now()
//             }, () => {
//                 console.log("Recommendations stored");
//             });

//             sendResponse({ 
//                 success: true, 
//                 data: data 
//             });
//         })
//         .catch(error => {
//             console.error("API request error:", error);
//             sendResponse({ 
//                 success: false, 
//                 error: error.message 
//             });
//         });

//         return true; // Keep the message channel open
//     }
// });

// // Listen for install/update events
// chrome.runtime.onInstalled.addListener(() => {
//     console.log("Extension installed/updated");
// });





chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script received message:", message);
    
    if (message.action === "sendHandle") {
        let userHandle = message.handle;
        console.log("Processing handle:", userHandle); // Log handle in background
        
        fetch("https://trishna.pythonanywhere.com/api/process_handle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ handle: userHandle })
        })
        .then(response => {
            console.log("API Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response data:", data);
            if (!data.recommendations || data.recommendations.length === 0) {
                throw new Error("No recommendations received");
            }
            
            // Store recommendations in chrome.storage
            chrome.storage.local.set({
                'lastRecommendations': data.recommendations,
                'timestamp': Date.now()
            }, () => {
                console.log("Recommendations stored in local storage:", data.recommendations);
            });
            
            sendResponse({
                success: true,
                data: data
            });
        })
        .catch(error => {
            console.error("API request error:", error);
            sendResponse({
                success: false,
                error: error.message
            });
        });
        
        return true; // Keep the message channel open
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed/updated");
});