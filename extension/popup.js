document.getElementById("sendHandle").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractHandle
        });
    });
});

function extractHandle() {
    let url = window.location.pathname; // Get the current page path
    let match = url.match(/^\/profile\/(.+)$/); // Extract handle using regex

    if (match) {
        let handle = match[1]; // Extracted handle
        console.log("handle is ",handle);
        chrome.runtime.sendMessage({ action: "sendHandle", handle: handle });
    } else {
        alert("No handle found! Please log in to Codeforces.");
    }
}

