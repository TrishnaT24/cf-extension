

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








document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup script loaded.");

    document.getElementById("sendHandle").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) {
                console.error("No active tab found");
                alert("No active tab found! Open a Codeforces profile page.");
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: extractHandle
            }).then(result => {
                console.log("Script execution result:", result);
            }).catch(err => {
                console.error("Script execution error:", err);
                alert("Error executing script! Check console for details.");
            });
        });
    });

    // Load recommendations from storage
    loadRecommendations();
});

// Function to extract handle from Codeforces profile URL
function extractHandle() {
    let url = window.location.pathname;
    let match = url.match(/^\/profile\/(.+)$/);

    if (match) {
        let handle = match[1];
        console.log("Extracted handle:", handle);

        chrome.runtime.sendMessage(
            { action: "sendHandle", handle: handle },
            response => {
                console.log("Background script response:", response);
                if (response?.success) {
                    alert("Recommendations received successfully!");
                    loadRecommendations(); // Update recommendations in popup
                } else {
                    alert("Error getting recommendations. Check console for details.");
                }
            }
        );
    } else {
        alert("No handle found! Please go to a Codeforces profile page.");
    }
}

// Function to load and display recommendations
function loadRecommendations() {
    chrome.storage.local.get("lastRecommendations", (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving recommendations:", chrome.runtime.lastError);
            return;
        }

        let recommendations = result.lastRecommendations || [];
        console.log("Loaded recommendations:", recommendations);

        let container = document.getElementById("recommendations");
        container.innerHTML = ""; // Clear old recommendations

        if (recommendations.length === 0) {
            container.innerHTML = "<p>No recommendations available.</p>";
            return;
        }

        recommendations.forEach(problem => {
            let item = document.createElement("div");
            item.innerHTML = `
                <p><strong>${problem.name}</strong> (Rating: ${problem.rating})</p>
                <a href="${problem.url}" target="_blank">Solve Now</a>
                <hr>
            `;
            container.appendChild(item);
        });
    });
}
