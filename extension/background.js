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
        console.log("Processing handle:", userHandle);
        
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
            
            // Store recommendations and notify about success only after storage is complete
            chrome.storage.local.set({
                'lastRecommendations': data.recommendations,
                'timestamp': Date.now()
            }, () => {
                console.log("Stored recommendations:", data.recommendations);
                // Send response only after storage is complete
                sendResponse({
                    success: true,
                    data: data.recommendations // Send recommendations directly in response
                });
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