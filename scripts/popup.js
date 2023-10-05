chrome.storage.sync.get("session_id", function (data) {
    var SIGN_IN_BUTTON = document.getElementById("signinButton");
    var EXPORT_BUTTON = document.getElementById("exportButton");
    var NOT_QUIZLET = document.getElementById("notQuizlet");

    if (data.session_id) {
        console.log("Session ID: " + data.session_id + ". Verifying...");
        var VERIFY_SESSION_URL = "https://lye.software/v2/user?session=" + data.session_id;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", VERIFY_SESSION_URL, true);
        xhr.setRequestHeader("lye-origin", "langstudy.tech/homepage.html");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                response_json = JSON.parse(xhr.responseText);
                console.log(response_json);
                if (!response_json.hasOwnProperty("error")) {
                    // get the url of the current tab and print it
                    console.log("Session ID is valid.");
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        var url = tabs[0].url;
                        if (url.includes("quizlet.com")) {
                            EXPORT_BUTTON.style.display = "block";
                        } else {
                            NOT_QUIZLET.style.display = "block";
                        }
                    });
                } else {
                    SIGN_IN_BUTTON.style.display = "block";
                    console.log("Session ID is invalid.");
                    
                }
            }
        }
        xhr.send();
    } else {
        SIGN_IN_BUTTON.style.display = "block";
        console.log("No session ID found.");
    }
});


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signinButton").addEventListener("click", function () {
        var SIGN_IN_PAGE = "https://lye.software/signin?forward=langstudy.tech-homepage.html"
        chrome.storage.sync.set({ "signing_in": true });
        chrome.tabs.create({ url: SIGN_IN_PAGE });
    });
    
    document.getElementById("exportButton").addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log("Sending message to tab " + tabs[0].id + ".");
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeQuizlet" });
        });
    });

    document.getElementById("clear").addEventListener("click", function () {
        chrome.storage.sync.clear();
        console.log("Cleared session ID.");
        window.close();
    });
});