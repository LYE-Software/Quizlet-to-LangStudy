// function get_quizlet() {
//     let divs = document.getElementsByTagName("div");
//     let possible_divs = []
//     for (div of divs) {
//         let width = div.getBoundingClientRect().width;
//         let height = div.getBoundingClientRect().height;
//         if (width > 200 && width / height > 3) {
//             possible_divs.push(div);
//         }
//     }

//     console.log("Found " + possible_divs.length + " possible term/definition divs.");
//     console.log(possible_divs[0])
//     let parent_usage_count = new Map()
//     for (div of possible_divs) {
//         let parent = div.parentElement;
//         if (parent_usage_count.has(parent)) {
//             parent_usage_count.set(parent, parent_usage_count.get(parent) + 1);
//         } else {
//             parent_usage_count.set(parent, 1);
//         }
//     }

//     console.log("Collected parent element usage counts.");

//     let max_parent = null;
//     for (parent of parent_usage_count.keys()) {
//         if (max_parent == null || parent_usage_count.get(parent) > parent_usage_count.get(max_parent) && parent.getBoundingClientRect().height > 400) {
//             max_parent = parent;
//         }
//     }

//     console.log("Located the term/def container with " + parent_usage_count.get(max_parent) + " children.");
//     console.log(max_parent)

//     output = {
//         name: document.title,
//         terms: [],
//         length: 0
//     }

//     let term_defs = max_parent.children;
    
//     for (let x = 0; x < term_defs.length; x++) {
//         let term_def = term_defs[x];
//         if (term_def.getElementsByTagName("iframe").length > 0) {
//             continue;
//         }
//         let children = []
//         try {
//             while (true) {
//                 children = term_def.children;
//                 if (children.length > 1) {
//                     if (children[0].innerText != "" && children[1].innerText != "") {
//                         break;
//                     }
//                 }
//                 term_def = children[0];
//             }

//             term_json = {
//                 isMulti: false,
//                 term: addslashes(children[0].innerText),
//                 answer: addslashes(children[1].innerText),
//                 hasImage: false,
//                 trainId: null,
//             }
//             console.log(term_json)
//             output.terms.push(term_json);
//         } catch (e) {
//             console.log("Failed to parse term/def.");
//         }
//     }

//     output.length = output.terms.length;
//     return output;
// }

function get_quizlet() {
    let terms = document.querySelectorAll(".SetPageTerms-term");
    console.log("Found " + terms.length + " terms.");
    studysheet = {
        "title": document.title,
        "terms": [],
    }
    for (let term of terms) {
        let termText = term.querySelectorAll("span")[0].innerText;
        let definitionText = term.querySelectorAll("span")[1].innerText;

        studysheet.terms.push({
            "term": termText,
            "answer": definitionText,
        });
    }
    return studysheet;
}

var uploading = false;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "scrapeQuizlet") {
        if (uploading) {
            return;
        }
        console.log("Scraping Quizlet...");

        var studysheet = get_quizlet()
        chrome.storage.sync.set({ "studysheet_in_contention": studysheet });
        
        console.log("[DEBUG] VISIT LANG IMPORT PAGE");
    }
});