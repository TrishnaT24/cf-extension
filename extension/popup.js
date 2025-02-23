document.getElementById("sendHandle").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      console.error("No active tab found");
      return;
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tabs[0].id },
        function: extractHandle,
      })
      .then((result) => {
        console.log("Script execution result:", result);
      })
      .catch((err) => {
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
  }
  let profileLink = document.querySelector("a[href^='/profile/']");
  if (profileLink) {
    let handle = profileLink.getAttribute("href").split("/").pop();
    console.log("Your handle:", handle);
  } else {
    console.log("Profile link not found!");
  }

  if (handle) {
    // Send message and wait for response
    chrome.runtime.sendMessage(
      { action: "sendHandle", handle: handle },
      (response) => {
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
