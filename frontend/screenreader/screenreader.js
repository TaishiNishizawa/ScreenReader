"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
* An instance of the Web Speech API
* (https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
* Initialized when the window first loads
*/
let VOICE_SYNTH;
/**
* The current speaking rate of the screen reader
* When updated, takes effect at the
* start of the next utterance
*/
let VOICE_RATE = 1;
/**
* Stores element types and their handler functions
* These handlers take in an HTMLElement's id, and return
* a string representation for uttering
*/
let ELEMENT_HANDLERS;
/**
* Stores element types and their interactive handler functions, which are asynchronous.
* These handlers take in an HTMLElement's id, and instead of a string, return a promise.
*/
let INTERACT_HANDLERS;
/**
* An array of the ids of the elements that are in the page. This gets filled in registerAll.
*/
let listOfIds;
/**
* An integer indicating the element that the reader
* is currently reading
*/
let current = 0;
/**
* Boolean indicating whether or not we should restart.
*/
let restart = true;
/**
* Boolean indicating whether we're in interact mode right now.
*/
let interactMode = false;
/**
* Boolean indicating whether to skip interact or not.
*/
let skipInteract = false;
/**
 * Reads out a HTMLElement and unless we're at the last element, we keep
 * making a call to this function recursively.
 * cancelReading() can also stop this function.
 */
function readPage() {
    return __awaiter(this, void 0, void 0, function* () {
        if (VOICE_SYNTH) {
            const ele = document.getElementById(listOfIds[current]);
            const elementTagName = ele.tagName;
            const ogElementBgColor = ele.style.backgroundColor;
            document.getElementById(ele.id).style.backgroundColor = "yellow";
            const eleHandler = ELEMENT_HANDLERS.get(elementTagName);
            if (eleHandler != null) {
                const text = eleHandler(ele);
                const speech = new SpeechSynthesisUtterance(text);
                speech.rate = VOICE_RATE;
                console.log(current);
                VOICE_SYNTH.speak(speech);
                document.onvisibilitychange = () => {
                    if (!document.hidden) {
                        resume();
                    }
                    else {
                        pause();
                    }
                };
                speech.onend = () => __awaiter(this, void 0, void 0, function* () {
                    /*
                    check if we need to set to interact mode given the current element.
                    This will only return true if we're not currently in the interaction mode
                    and the current element belongs in one of the async handlers
                    */
                    if (!skipInteract && INTERACT_HANDLERS.has(ele.tagName)) {
                        interactMode = true;
                        yield INTERACT_HANDLERS.get(ele.tagName)(ele);
                    }
                    document.getElementById(ele.id).style.backgroundColor = ogElementBgColor;
                    // set modes accordingly
                    interactMode = false;
                    skipInteract = false;
                    const lastIdx = listOfIds.length - 1;
                    const notAtLastIdx = current <= lastIdx;
                    if (notAtLastIdx) {
                        current += 1;
                        yield readPage();
                    }
                    else {
                        annouceEndOfDocument();
                    }
                });
            }
        }
    });
}
/**
 * Function that does all the "registering" by setting the respec
 */
function registerAll() {
    // assign all the handlers for each respective html element to the two hashmaps
    const elements = document.getElementsByTagName("*");
    ELEMENT_HANDLERS = new Map();
    INTERACT_HANDLERS = new Map();
    for (let i = 0; i < elements.length; i++) {
        const el = elements.item(i);
        el.id = i.toString();
        assignIndHeaders(elements, i);
    }
    listOfIds = [];
    let i = 0;
    let j = 0;
    while (i < elements.length) {
        const ele = elements.item(i);
        if (ELEMENT_HANDLERS.has(ele.tagName)) {
            if (ele.id === "") {
                ele.id = j.toString();
                j++;
            }
            listOfIds.push(ele.id);
        }
        i++;
    }
}
/**
 * Loading the window. This is what starts everything.
 */
window.onload = () => {
    VOICE_SYNTH = window.speechSynthesis;
    registerAll();
    document.body.innerHTML = `
        <div id="screenReader">
            <button>Start [Space]</button>
            <button>Pause/Resume [P]</button>
            <button onclick="changeVoiceRate(1.1);">Speed Up [Right Arrow]</button>
            <button onclick="changeVoiceRate(0.9);">Slow Down [Left Arrow]</button>
        </div>
    ` + document.body.innerHTML;
    document.addEventListener("keydown", globalKeystrokes);
};
/**
 * Function that assigns the correct header handles for all the elements that are in our page's DOM.
 * @param items the set of all DOM elements in the page
 * @param index the index of the element.
 * @returns void.
 */
function assignIndHeaders(items, index) {
    let curElement = items.item(index);
    if (curElement != null) {
        let tag = curElement.tagName;
        switch (tag) {
            case 'TITLE':
                ELEMENT_HANDLERS.set("TITLE", handleTitle);
                break;
            case 'H1':
                ELEMENT_HANDLERS.set("H1", handleHeader);
                break;
            case 'H2':
                ELEMENT_HANDLERS.set("H2", handleHeader);
                break;
            case 'H3':
                ELEMENT_HANDLERS.set("H3", handleHeader);
                break;
            case 'H4':
                ELEMENT_HANDLERS.set("H4", handleHeader);
                break;
            case 'H5':
                ELEMENT_HANDLERS.set("H5", handleHeader);
                break;
            case 'H6':
                ELEMENT_HANDLERS.set("H6", handleHeader);
                break;
            case 'P':
                ELEMENT_HANDLERS.set("P", handleParagrah);
                break;
            case 'A':
                ELEMENT_HANDLERS.set("A", anchorHandler);
                INTERACT_HANDLERS.set("A", handleInteractiveAnchor);
                break;
            case 'LABEL':
                ELEMENT_HANDLERS.set("LABEL", handleLabel);
            case 'IMG':
                ELEMENT_HANDLERS.set("IMG", handleImg);
                break;
            case 'TABLE':
                ELEMENT_HANDLERS.set("TABLE", tableHandler);
                break;
            case 'CAPTION':
                ELEMENT_HANDLERS.set("CAPTION", captionHandler);
                break;
            case 'TR':
                ELEMENT_HANDLERS.set("TR", tableRowHandler);
                break;
            case 'TH':
                ELEMENT_HANDLERS.set("TH", tableHeaderHandler);
                break;
            case 'TD':
                ELEMENT_HANDLERS.set("TD", tableCellHandler);
                break;
            case 'TFOOT':
                ELEMENT_HANDLERS.set("TFOOT", tableFootHandler);
                break;
            case 'INPUT':
                ELEMENT_HANDLERS.set("INPUT", inputHandler);
                INTERACT_HANDLERS.set("INPUT", handleInteractiveInput);
                break;
            case 'BUTTON':
                ELEMENT_HANDLERS.set("BUTTON", buttonHandler);
                INTERACT_HANDLERS.set("BUTTON", handleInteractiveButton);
                break;
            default:
                return;
        }
    }
}
/**
 * Changes the speaking rate of the screen reader.
 * @param factor multiplier on the speaking rate
 */
function changeVoiceRate(factor) {
    VOICE_RATE *= factor;
    if (VOICE_RATE > 4) {
        VOICE_RATE = 4;
    }
    else if (VOICE_RATE < 0.25) {
        VOICE_RATE = 0.25;
    }
}
/**
 * helper function that gets called when the reader has reached the last element and we're at the end of our page.
 * We annouce as such and set restart back to true in case user wants to read the page again.
 */
function annouceEndOfDocument() {
    if (VOICE_SYNTH) {
        VOICE_SYNTH.speak(new SpeechSynthesisUtterance("End of document. Press space again to go back to start of page."));
    }
    restart = true;
}
/**
 * Moves to the next HTML element in the DOM.
 */
function next() {
    const size = listOfIds.length;
    if (current + 1 >= size) {
        cancelReading();
        annouceEndOfDocument();
    }
    else {
        cancelReading();
    }
}
/**
 * Moves to the previous HTML element in the DOM.
 */
function previous() {
    if (current >= 1) {
        if (restart) {
            cancelReading();
            restart = false;
            readPage();
        }
        else {
            current -= 2;
            cancelReading();
        }
    }
    else {
        // set current back to 0
        current = 0;
        cancelReading();
    }
}
/**
 * Starts reading the document at a specified index.
 * Used by next(), previous() and start()
 */
function start() {
    if (restart) {
        current = 0;
        restart = false;
        readPage();
    }
    else {
        current = -1;
        cancelReading();
    }
}
/**
 * Pauses the reading of the page.
 */
function pause() {
    VOICE_SYNTH.pause();
}
/**
 * Resumes the reading of the page.
 */
function resume() {
    VOICE_SYNTH.resume();
}
/**
 * Cancels the current reading.
 * Cancels interaction.
 */
function cancelReading() {
    skipInteract = true;
    VOICE_SYNTH.cancel();
}
/**
 * Listens for keydown events.
 * @param event keydown event
 */
function globalKeystrokes(event) {
    if (!interactMode) {
        switch (event.key) {
            case (" "):
                event.preventDefault();
                start();
                break;
            case ("P"):
            case ("p"):
                if (VOICE_SYNTH.paused) {
                    resume();
                }
                else if (VOICE_SYNTH.speaking || VOICE_SYNTH.pending) {
                    pause();
                }
                else {
                    start();
                }
                break;
            case ("ArrowRight"):
                event.preventDefault();
                changeVoiceRate(1.1);
                break;
            case ("ArrowLeft"):
                event.preventDefault();
                changeVoiceRate(0.9);
                break;
            case ("ArrowUp"):
                event.preventDefault();
                previous();
                break;
            case ("ArrowDown"):
                event.preventDefault();
                next();
                break;
            default:
                break;
        }
    }
}
/**
 * handles titles.
 */
function handleTitle(ele) {
    return "Title: " + ele.innerText;
}
function handleLabel(ele) {
    return "Label for input form: " + ele.innerText;
}
/**
 * handles all headers.
 */
function handleHeader(ele) {
    return "Heading " + ele.tagName[1] + ": " + ele.innerText;
}
/**
 * handles paragraphs.
 */
function handleParagrah(element) {
    return element.innerText;
}
/**
 * handles images.
 */
function handleImg(element) {
    if (element.hasAttribute("alt")) {
        return "An image of " + element.getAttribute("alt");
    }
    return "An image of unknown description.";
}
/**
 * handles anchors.
 */
function anchorHandler(element) {
    return "A link for " + element.textContent + ". Press Enter to open the link.";
}
/**
 * handles inputs.
 */
function inputHandler(ele) {
    // label for this input is annouced already.
    return "Input element. " + "Enter the letter i to start typing. Press Escape to Exit.";
}
/**
 * handles buttons.
 */
function buttonHandler(ele) {
    const buttonLabels = ele.labels;
    return "A button with description: " + buttonLabels.item(0).innerText + ". Press Enter to click.";
}
/**
 * handles tables.
 */
function tableHandler() {
    return "A table.";
}
/**
 * handles captions.
 */
function captionHandler(ele) {
    return "Caption: " + ele.textContent;
}
/**
 * handles table cells.
 */
function tableCellHandler(ele) {
    return "Cell: " + ele.innerText;
}
/**
 * handles table footers.
 */
function tableFootHandler(ele) {
    return "Footer: " + ele.innerText;
}
/**
 * handles table headers.
 */
function tableHeaderHandler(ele) {
    return "Header: " + ele.innerText;
}
/**
 * handles table rows.
 */
function tableRowHandler() {
    return "A Row.";
}
/**
 * async handle anchors.
 */
function handleInteractiveAnchor(ele) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ele.hasAttribute("href")) {
            document.addEventListener("keydown", clickOnLink);
            yield wait(1500);
            document.removeEventListener("keydown", clickOnLink);
        }
    });
}
/**
 * Handles clicks, called in handleInteractiveAnchor.
 */
function clickOnLink(event) {
    const currentEl = document.getElementById(listOfIds[current]);
    let hasAtt = false;
    let linkURL = "";
    if (currentEl.hasAttribute("href")) {
        hasAtt = true;
        linkURL = currentEl.getAttribute("href");
        if (event.key === "Enter") {
            window.open(linkURL, "_blank");
        }
    }
    else {
        console.log("not valid link");
    }
}
/**
 * async handles input interactive functionality.
 */
function handleInteractiveInput() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentEl = document.getElementById(listOfIds[current]);
        if (currentEl != null) {
            const type = currentEl.type;
            switch (type) {
                case "text":
                    let tmID;
                    let inputListener;
                    return new Promise(resolve => {
                        document.addEventListener("keydown", inputListener = (event) => {
                            const eventKey = event.key;
                            switch (eventKey) {
                                case "i":
                                    event.preventDefault();
                                    clearTimeout(tmID);
                                    document.getElementById(listOfIds[current]).focus();
                                    break;
                                case "Escape":
                                    document.removeEventListener("keydown", inputListener);
                                    document.getElementById(listOfIds[current]).blur();
                                    resolve();
                                    break;
                            }
                        });
                        tmID = setTimeout(() => {
                            document.removeEventListener("keydown", inputListener);
                            resolve();
                        }, 3000);
                    });
                case "submit":
                    yield handleInteractiveButton();
                    break;
                case "button":
                    yield handleInteractiveButton();
                    break;
                default:
                    break;
            }
        }
    });
}
/**
 * Sleeps for a specified amount of time,
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
/**
 * async handling of buttons interactive functionality.
 */
function handleInteractiveButton() {
    return __awaiter(this, void 0, void 0, function* () {
        const buttonClicker = (event) => {
            if (event.key === "Enter") {
                document.getElementById(listOfIds[current]).click();
            }
        };
        document.addEventListener("keydown", buttonClicker);
        yield wait(3000);
        document.removeEventListener("keydown", buttonClicker);
    });
}
