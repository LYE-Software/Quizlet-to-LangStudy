
chrome.storage.sync.get("studysheet_in_contention", function (data) {
    if (Object.keys(data).length == 0) {
        const event = new CustomEvent('noSheetData');
        document.dispatchEvent(event);
        return;
    }
    const event = new CustomEvent('loadImportedSheet', { detail: { studysheet: data.studysheet_in_contention } });
    document.dispatchEvent(event);

    chrome.storage.sync.remove("studysheet_in_contention");
});