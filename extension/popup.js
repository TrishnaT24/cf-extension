

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
//     // let url = window.location.pathname;
//     // let match = url.match(/^\/profile\/(.+)$/);
//     let profileLink = document.querySelector("a[href^='/profile/']");
//     if (profileLink) {
//         let handle =  profileLink.getAttribute("href").split("/").pop();
//         console.log("Extracted handle:", handle);
        
//         // Send message and wait for response
//         chrome.runtime.sendMessage(
//             { action: "sendHandle", handle: handle },
//             response => {
//                 console.log("Background script response:", response);
//                 //line added
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





// popup.js
document.getElementById("sendHandle").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) {
            console.error("No active tab found");
            return;
        }
        
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
                // This function runs in webpage context
                let profileLink = document.querySelector("a[href^='/profile/']");
                if (profileLink) {
                    return profileLink.getAttribute("href").split("/").pop();
                }
                return null;
            }
        }).then(result => {
            console.log("Script execution result:", result);
            
            if (result && result[0]?.result) {
                const handle = result[0].result;
                console.log("Extracted handle:", handle);
                
                // Send message to background script
                chrome.runtime.sendMessage(
                    { action: "sendHandle", handle: handle },
                    response => {
                        console.log("Background script response:", response);
                        
                        if (response?.success) {
                            // Display recommendations in popup
                            const recommendationsDiv = document.getElementById('recommendationsDiv');
                            recommendationsDiv.innerHTML = '<h4>Recommended Problems:</h4>';
                            
                            response.data.recommendations.forEach(problem => {
                                const problemDiv = document.createElement('div');
                                problemDiv.className = 'problem';
                                
                                const problemLink = document.createElement('a');
                                problemLink.href = problem.url;
                                problemLink.className = 'problem-link';
                                problemLink.target = '_blank';
                                problemLink.textContent = problem.name;
                                
                                problemDiv.appendChild(problemLink);
                                recommendationsDiv.appendChild(problemDiv);
                            });
                            
                            alert("Recommendations received successfully!");
                        } else {
                            document.getElementById('recommendationsDiv').innerHTML = 
                                '<p style="color: red;">Error getting recommendations. Check console for details.</p>';
                            alert("Error getting recommendations. Check console for details.");
                        }
                    }
                );
            } else {
                alert("No handle found! Please go to a Codeforces profile page.");
            }
        }).catch(err => {
            console.error("Script execution error:", err);
        });
    });
});

// Display stored recommendations when popup opens
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['lastRecommendations'], function(result) {
        if (result.lastRecommendations) {
            const recommendationsDiv = document.getElementById('recommendationsDiv');
            recommendationsDiv.innerHTML = '<h4>Last Received Recommendations:</h4>';
            
            result.lastRecommendations.forEach(problem => {
                const problemDiv = document.createElement('div');
                problemDiv.className = 'problem';
                
                const problemLink = document.createElement('a');
                problemLink.href = problem.url;
                problemLink.className = 'problem-link';
                problemLink.target = '_blank';
                problemLink.textContent = problem.name;
                
                problemDiv.appendChild(problemLink);
                recommendationsDiv.appendChild(problemDiv);
            });
        }
    });
});
