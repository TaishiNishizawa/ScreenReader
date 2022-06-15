/**
* An instance of the Web Speech API
* (https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
* Initialized when the window first loads
*/
let VOICE_SYNTH: SpeechSynthesis;

/**
* The current speaking rate of the screen reader
* When updated, takes effect at the
* start of the next utterance
*/
let VOICE_RATE: number = 1;

/**
* Stores element types and their handler functions
* These handlers take in an HTMLElement's id, and return
* a string representation for uttering
*/
let ELEMENT_HANDLERS: Map<string, (ele: HTMLElement) => string>;
/**
* Stores element types and their interactive handler functions, which are asynchronous.
* These handlers take in an HTMLElement's id, and instead of a string, return a promise. 
*/
let INTERACT_HANDLERS: Map<string, (ele: HTMLElement) => Promise<void>>;

/**
* An array of the ids of the elements that are in the page. This gets filled in registerAll. 
*/
let listOfIds: string[];

/**
* An integer indicating the element that the reader
* is currently reading
*/
let current: number = 0;
/**
* Boolean indicating whether or not we should restart.
*/
let restart: boolean = true;
/**
* Boolean indicating whether we're in interact mode right now.
*/
let interactMode: boolean = false;
/**
* Boolean indicating whether to skip interact or not.
*/
let skipInteract: boolean = false;

/**
 * Reads out a HTMLElement and unless we're at the last element, we keep 
 * making a call to this function recursively. 
 * cancelReading() can also stop this function. 
 */
 async function readPage() {
    if (VOICE_SYNTH) {
        const ele: HTMLElement = document.getElementById(listOfIds[current])!;
        const elementTagName = ele.tagName;
        const ogElementBgColor: string = ele.style.backgroundColor;
        document.getElementById(ele.id)!.style.backgroundColor = "yellow";
        const eleHandler: (HTMLe: HTMLElement) => string = ELEMENT_HANDLERS.get(elementTagName)!

        if (eleHandler != null) {
            const text: string = eleHandler(ele);

            const speech: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(text);
    
            speech.rate = VOICE_RATE;
            console.log(current);
    
            VOICE_SYNTH.speak(speech);
    
            document.onvisibilitychange = () => {
                if (!document.hidden) {
                    resume();
                } else {
                    pause();
                }
            }
    
            speech.onend = async () => {
                /*
                check if we need to set to interact mode given the current element. 
                This will only return true if we're not currently in the interaction mode 
                and the current element belongs in one of the async handlers
                */
                if (!skipInteract && INTERACT_HANDLERS.has(ele.tagName)) {
                    interactMode = true;
                    await INTERACT_HANDLERS.get(ele.tagName)!(ele);
                }    
                document.getElementById(ele.id)!.style.backgroundColor = ogElementBgColor;
                // set modes accordingly
                interactMode = false;
                skipInteract = false;
                const lastIdx : number = listOfIds.length - 1;
                const notAtLastIdx : Boolean = current <= lastIdx; 
                if (notAtLastIdx) {
                    current += 1;
                    await readPage();
                } else {
                    annouceEndOfDocument();
                }
            }
        }
        }
}

/**
 * Function that does all the "registering" by setting the respec
 */
function registerAll() {
    // assign all the handlers for each respective html element to the two hashmaps
    const elements: HTMLCollection = document.getElementsByTagName("*");
    ELEMENT_HANDLERS = new Map();
    INTERACT_HANDLERS = new Map();
    for (let i = 0; i < elements.length; i++) {
        const el: HTMLElement = elements.item(i) as HTMLElement;
        el.id = i.toString();
        assignIndHeaders(elements, i);
    }

    listOfIds = [];
    let i: number = 0;
    let j: number = 0;
    while (i < elements.length) {
        const ele: HTMLElement = elements.item(i) as HTMLElement;
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
}

/**
 * Function that assigns the correct header handles for all the elements that are in our page's DOM. 
 * @param items the set of all DOM elements in the page
 * @param index the index of the element.
 * @returns void. 
 */
function assignIndHeaders(items: HTMLCollection, index: number): void {
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
function changeVoiceRate(factor: number): void {
    VOICE_RATE *= factor
    if (VOICE_RATE > 4) {
        VOICE_RATE = 4;
    } else if (VOICE_RATE < 0.25) {
        VOICE_RATE = 0.25;
    }
}

/**
 * helper function that gets called when the reader has reached the last element and we're at the end of our page. 
 * We annouce as such and set restart back to true in case user wants to read the page again.
 */
function annouceEndOfDocument() : void {
    if (VOICE_SYNTH) {
        VOICE_SYNTH.speak(new SpeechSynthesisUtterance("End of document. Press space again to go back to start of page."));
    }
    restart = true;
}

/**
 * Moves to the next HTML element in the DOM.
 */
function next(): void {
    const size = listOfIds.length;
    if (current + 1 >= size) {
        cancelReading();
        annouceEndOfDocument();
    } else {
        cancelReading();
    }
}

/**
 * Moves to the previous HTML element in the DOM.
 */
function previous(): void {
    if (current >= 1) {
        if (restart) {
            cancelReading();
            restart = false;
            readPage();
        } else {
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
function start(): void {
    if (restart) {
        current = 0;
        restart = false;
        readPage();
    } else {
        current = -1;
        cancelReading();
    }
}

/**
 * Pauses the reading of the page.
 */
function pause(): void {
    VOICE_SYNTH.pause();
}

/**
 * Resumes the reading of the page.
 */
function resume(): void {
    VOICE_SYNTH.resume();
}

/**
 * Cancels the current reading.
 * Cancels interaction.
 */
function cancelReading(): void {
    skipInteract = true;
    VOICE_SYNTH.cancel();
}

/**
 * Listens for keydown events.
 * @param event keydown event
 */
function globalKeystrokes(event: KeyboardEvent): void {
    if (!interactMode) {
        switch (event.key) {
            case (" "):
                event.preventDefault();
                start();
                break;
            case ("P"): case ("p"):
                if (VOICE_SYNTH.paused) {
                    resume();
                } else if (VOICE_SYNTH.speaking || VOICE_SYNTH.pending) {
                    pause();
                } else {
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
function handleTitle(ele: HTMLElement): string {
    return "Title: " + ele.innerText;
}
function handleLabel(ele: HTMLElement): string {
    return "Label for input form: " + ele.innerText;
}
/**
 * handles all headers.
 */
function handleHeader(ele: HTMLElement): string {
    return "Heading " + ele.tagName[1] + ": " + ele.innerText;
}

/**
 * handles paragraphs.
 */
function handleParagrah(element: HTMLElement): string {
    return element.innerText;
}

/**
 * handles images.
 */
function handleImg(element: HTMLElement): string {
    if (element.hasAttribute("alt")) {
        return "An image of " + element.getAttribute("alt")!;
    }
    return "An image of unknown description.";
}

/**
 * handles anchors.
 */
function anchorHandler(element: HTMLElement): string {
    return "A link for " + element.textContent as string + ". Press Enter to open the link.";
}

/**
 * handles inputs.
 */
function inputHandler(ele: HTMLElement): string {
    // label for this input is annouced already.
    return "Input element. " + "Enter the letter i to start typing. Press Escape to Exit.";
}

/**
 * handles buttons.
 */
function buttonHandler(ele: HTMLElement): string {
    const buttonLabels: NodeListOf<HTMLElement> = (ele as HTMLButtonElement).labels;
    return "A button with description: " + buttonLabels.item(0).innerText + ". Press Enter to click.";
}

/**
 * handles tables.
 */
function tableHandler(): string {
    return "A table.";
}

/**
 * handles captions.
 */
function captionHandler(ele: HTMLElement): string {
    return "Caption: " + ele.textContent;
}

/**
 * handles table cells.
 */
function tableCellHandler(ele: HTMLElement): string {
    return "Cell: " + ele.innerText;
}

/**
 * handles table footers.
 */
function tableFootHandler(ele: HTMLElement): string {
    return "Footer: " + ele.innerText;
}

/**
 * handles table headers.
 */
function tableHeaderHandler(ele: HTMLElement): string {
    return "Header: " + ele.innerText;
}

/**
 * handles table rows.
 */
function tableRowHandler(): string {
    return "A Row.";
}

/**
 * async handle anchors.
 */
async function handleInteractiveAnchor(ele: HTMLElement): Promise<void> {
    if (ele.hasAttribute("href")) {
        document.addEventListener("keydown", clickOnLink);
        await wait(1500);
        document.removeEventListener("keydown", clickOnLink);
    }
}
/**
 * Handles clicks, called in handleInteractiveAnchor.
 */
function clickOnLink(event: KeyboardEvent) {
    const currentEl = document.getElementById(listOfIds[current])!
    let hasAtt = false;
    let linkURL : string = "";
    if (currentEl.hasAttribute("href")) {
        hasAtt = true;
        linkURL = currentEl.getAttribute("href")!
        if (event.key === "Enter") {
            window.open(linkURL, "_blank");
        }
    } else {
        console.log("not valid link");
    }
}
/**
 * async handles input interactive functionality.
 */
async function handleInteractiveInput(): Promise<void> {
    const currentEl : HTMLInputElement = document.getElementById(listOfIds[current]) as HTMLInputElement;
    if (currentEl != null) {
        const type: string = currentEl.type;
        switch (type) {
            case "text":
                let tmID: number;
                let inputListener: (e: KeyboardEvent) => void;
                return new Promise<void>(resolve => {
                    document.addEventListener("keydown", 
                    inputListener = (event: KeyboardEvent) => {
                        const eventKey = event.key;
                        switch (eventKey) {
                            case "i":
                                event.preventDefault();
                                clearTimeout(tmID);
                                document.getElementById(listOfIds[current])!.focus();
                                break;
                            case "Escape":
                                document.removeEventListener("keydown", inputListener);
                                document.getElementById(listOfIds[current])!.blur();
                                resolve();
                                break;
                        }
                    })
                    tmID = setTimeout(() => {
                        document.removeEventListener("keydown", inputListener)
                        resolve();
                    }, 3000);
                })
            case "submit": 
                await handleInteractiveButton();
                break;
            case "button":
                await handleInteractiveButton();
                break;
            default:
                break;
        }
    }
}

/**
 * Sleeps for a specified amount of time,
 */
const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * async handling of buttons interactive functionality.
 */
async function handleInteractiveButton(): Promise<void> {
    const buttonClicker: (e: KeyboardEvent) => void = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            document.getElementById(listOfIds[current])!.click();
        }
    }
    document.addEventListener("keydown", buttonClicker);
    await wait(3000);
    document.removeEventListener("keydown", buttonClicker);
}