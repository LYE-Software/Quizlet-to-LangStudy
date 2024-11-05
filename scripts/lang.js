
chrome.storage.sync.get("studysheet_in_contention", function (data) {
    let ssContainer = document.getElementById("studysheet-container");
    let infoPanel = document.getElementById("left-panel");
    if (Object.keys(data).length == 0) {
        setTimeout(() => {
            ssContainer.innerHTML = `<h2 style="font-family: Poppins; padding: 50px;" >You haven't selected a Quizlet Studyset yet. Go to Quizlet and use the browser extension to select a studyset.</h2>`
            infoPanel.style.width = "0";
            infoPanel.style.flex = "0 0 0";
            infoPanel.style.opacity = "0";
            infoPanel.parentElement.style.gap = "0";
        }, 500);
        return;
    }

    const event = new CustomEvent('loadImportedSheet', { detail: { studysheet: data.studysheet_in_contention } });
    document.dispatchEvent(event);
});