document.addEventListener("DOMContentLoaded", function () {    

    function showError(text) {
        let info = document.getElementsByClassName("info-panel")[0];
        info.style.display = "none";
        
        let warningText = document.getElementById("warningText");
        warningText.innerHTML = text;

        let importButton = document.getElementById("exportButton");
        importButton.style.display = "none";
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // if the tab doesnt contain quizlet.com
        if (!tabs[0].url.includes("quizlet.com")) {
            showError("This extension only works on Quizlet! Visit the website and try again.");
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeQuizlet" }, function (response) {
            if (Object.keys(response).includes("error")) {
                showError("We couldn't find a Studyset on this page!");
                return;
            }
            let sheetTitle = document.getElementById("sheetTitle");
            sheetTitle.innerHTML = response.title;

            let termCount = document.getElementById("termCount");
            termCount.innerHTML = response.terms.length + " terms";

            let warningText = document.getElementById("warningText");
            if (response.terms.length % 100 == 0) {
                warningText.innerHTML = "Ensure Quizlet is displaying all terms before importing.";
            } else {
                warningText.innerHTML = "";
            }
        });
    });

    let sendToLangButton = document.getElementById("exportButton");
    sendToLangButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeQuizlet" }, function (response) {
                chrome.storage.sync.set({ "studysheet_in_contention": response }, function () {
                    // chrome.tabs.create({ url: "https://langstudy.tech/import" });
                });
            });
        });
    });
});


