function get_quizlet() {
    let divs = document.getElementsByTagName("div");
    let possible_divs = []
    for (div of divs) {
        let width = div.getBoundingClientRect().width;
        let height = div.getBoundingClientRect().height;
        if (width > 200 && width / height > 3) {
            possible_divs.push(div);
        }
    }

    console.log("Found " + possible_divs.length + " possible term/definition divs.");
    console.log(possible_divs[0])
    let parent_usage_count = new Map()
    for (div of possible_divs) {
        let parent = div.parentElement;
        if (parent_usage_count.has(parent)) {
            parent_usage_count.set(parent, parent_usage_count.get(parent) + 1);
        } else {
            parent_usage_count.set(parent, 1);
        }
    }

    console.log("Collected parent element usage counts.");

    let max_parent = null;
    for (parent of parent_usage_count.keys()) {
        if (max_parent == null || parent_usage_count.get(parent) > parent_usage_count.get(max_parent) && parent.getBoundingClientRect().height > 400) {
            max_parent = parent;
        }
    }

    console.log("Located the term/def container with " + parent_usage_count.get(max_parent) + " children.");
    console.log(max_parent)

    output = {
        name: document.title,
        terms: [],
        length: 0
    }

    let term_defs = max_parent.children;
    
    for (let x = 0; x < term_defs.length; x++) {
        let term_def = term_defs[x];
        if (term_def.getElementsByTagName("iframe").length > 0) {
            continue;
        }
        let children = []
        try {
            while (true) {
                children = term_def.children;
                if (children.length > 1) {
                    if (children[0].innerText != "" && children[1].innerText != "") {
                        break;
                    }
                }
                term_def = children[0];
            }

            term_json = {
                isMulti: false,
                term: addslashes(children[0].innerText),
                answer: addslashes(children[1].innerText),
                hasImage: false,
                trainId: null,
            }
            console.log(term_json)
            output.terms.push(term_json);
        } catch (e) {
            console.log("Failed to parse term/def.");
        }
    }

    output.length = output.terms.length;
    return output;
}

function addslashes( str ) {
    // return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    return str.replaceAll("\"", "\\\"").replaceAll("\n", " ");
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
            xhr.send(JSON.stringify(studysheet))
        });
    }
});