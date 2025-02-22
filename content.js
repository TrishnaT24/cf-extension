// Wait until the page loads
document.addEventListener("DOMContentLoaded", () => {
    let handleElement = document.querySelector('.lang-chooser span a');
    if (handleElement) {
        let handle = handleElement.innerText.trim();
        console.log("Extracted Codeforces Handle:", handle);
        
        // Send the handle to the background script
        chrome.runtime.sendMessage({ action: "sendHandle", handle: handle });
    } else {
        console.log("Codeforces handle not found!");
    }
});
