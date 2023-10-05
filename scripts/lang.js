console.log(window.location.href);

var url = new URL(window.location.href);
var session = url.searchParams.get("session");

if (session) {
    console.log("Session ID: " + session + ". Saving...");
    chrome.storage.sync.set({ "session_id": session });
    chrome.storage.sync.get("signing_in", function (data) {
        if (data.signing_in) {
            alert("Successfully signed in! You can close this tab and export your Quizlet sets.");
            chrome.storage.sync.set({ "signing_in": false });
        }
    });
} else {
    console.log("No session ID found.");
}