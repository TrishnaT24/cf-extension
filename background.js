chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendHandle") {
        let userHandle = message.handle;
        console.log("Sending handle to API:", userHandle);

        fetch("https://your-ml-api.com/process_handle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ handle: userHandle })
        })
        .then(response => response.json())
        .then(data => console.log("Response from API:", data))
        .catch(error => console.error("Error sending handle:", error));
    }
});
