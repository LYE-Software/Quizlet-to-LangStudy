function get_page() {
    return document.documentElement.innerHTML;
}

function get_quizlet() {
    const page = get_page();
    const parser = new DOMParser();
    const doc = parser.parseFromString(page, 'text/html');

    const container = doc.querySelector('.SetPage');
    if (!container) {
        const error = doc.querySelector('.c1u0rqik');
        if (!error) {
            console.error('Unexpected structure');
            return;
        }
        const error_header = error.querySelector('h2').textContent.trim();
        const quizlet_error = error.querySelectorAll('.UIParagraph')[0].textContent.trim();
        if (error_header === "This study set is private") {
            console.error('Private set:', quizlet_error);
        } else {
            console.error('Unknown Quizlet error:', quizlet_error);
        }
        return;
    }

    const title = doc.querySelector('.SetPage-setTitle').querySelector('h1').textContent.trim();

    const contents = doc.querySelectorAll('.SetPageTerm-content');
    const entries = [];

    contents.forEach(content => {
        const term = content.childNodes[0].textContent;
        const definition = content.childNodes[1].textContent;
        entries.push([term, definition]);
    });

    const output = {
        "name": title,
        "terms": [],
    };

    entries.forEach(entry => {
        const term = {
            "isMulti": false,
            "term": addslashes(entry[0]),
            "answer": addslashes(entry[1]),
            "hasImage": false,
            "trainId": null,
        };
        output["terms"].push(term);
    });

    output["length"] = output["terms"].length;
    console.log(output);
    return output;
}

function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

var uploading = false;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "scrapeQuizlet") {
        if (uploading) {
            return;
        }
        uploading = true;
        console.log("Scraping Quizlet...");

        // create a position:fixed div to cover the page
        var div = document.createElement("div");
        div.style.position = "fixed";

        div.style.top = 0;
        div.style.left = 0;
        div.style.right = 0;
        div.style.bottom = 0;

        div.style.zIndex = 999999
        div.style.backgroundColor = "wheat";
        div.style.opacity = 0.75;

        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";
        
        div.innerHTML = "<h1>Sending to LangStudy...</h1>";
        div.style.fontSize = "40px";

        document.body.appendChild(div);

        var studysheet = get_quizlet()
        chrome.storage.sync.get("session_id", function (data) {
            console.log("Session ID: " + data.session_id + ". Uploading...");
            var LANG_UPLOAD_URL = "https://backend.langstudy.tech/" + data.session_id + "/Studysheets/upload/" + studysheet.name;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", LANG_UPLOAD_URL, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("lye-origin", "langstudy.tech/homepage.html");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (xhr.responseText == "uploaded") {
                        window.location.href = "https://langstudy.tech/homepage.html";
                    } else {
                        console.log("Failed to upload studysheet.");
                        alert("Failed to upload studysheet.");
                        div.remove();
                    }
                }
            }
            console.log("Sending: " + JSON.stringify(studysheet));
            xhr.send(JSON.stringify(studysheet));
        });
    }
});