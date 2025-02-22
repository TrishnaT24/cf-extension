// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "sendHandle") {
//         let userHandle = message.handle;
//         console.log("Sending handle to API:", userHandle);

//         fetch("https://trishna.pythonanywhere.com/api/process_handle", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ handle: userHandle })
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log("Response from API:", data);  // Check API response
//             if (!data.recommendations || data.recommendations.length === 0) {
//                 console.error("No recommendations received:", data);
//             }
//         })
//         .catch(error => console.error("Error sending handle:", error));
//     }
// });





chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script received message:", message);

    if (message.action === "sendHandle") {
        let userHandle = message.handle;
        console.log("Processing handle:", userHandle);

        // Make the API request
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
                console.log("Recommendations stored");
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

// Listen for install/update events
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed/updated");
});