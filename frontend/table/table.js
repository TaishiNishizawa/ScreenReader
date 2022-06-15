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
// run tsc in this directory to compile to js before testing
const loadButton = document.getElementById("loader");
const content = document.getElementById("content");
const drop = document.getElementById("tableOptions");
let str = "";
let count = 0;
let prevResult = [];
// To load table and generate dropdown
loadButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    if (count == 0) {
        fetch('http://localhost:4568/load')
            .then((response) => response.json())
            .then((data) => str = JSON.stringify(data));
    }
    yield fetch('http://localhost:4568/load')
        .then((response) => response.json())
        .then((data) => str = JSON.stringify(data));
    const withoutFirstAndLast = str.slice(1, -1);
    const newString = withoutFirstAndLast.replace(/"/g, '');
    let result = newString.split(',');
    if (result == prevResult) {
        return;
    }
    prevResult = result;
    let i, L = drop.options.length - 1;
    for (i = L; i >= 0; i--) {
        drop.remove(i);
    }
    if (drop.length == 0) {
        for (let i = 0; i < result.length; i++) {
            let option = document.createElement("option");
            option.text = result[i];
            option.id = result[i];
            drop.add(option, drop[0]);
        }
    }
    const toFetch = "http://localhost:4568/viz?tableName=" + drop.value;
    fetch(toFetch)
        .then((response) => response.json())
        .then((data) => visualizeData(data));
}));
drop.addEventListener('change', () => {
    console.log('You selected: ', drop.value);
    const toFetch = "http://localhost:4568/viz?tableName=" + drop.value;
    fetch(toFetch)
        .then((response) => response.json())
        .then((data) => visualizeData(data));
    content.innerHTML = str;
});
function visualizeData(data) {
    let col = [];
    for (let i = 0; i < data.length; i++) {
        for (let key in data[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }
    // Create a table.
    let table = document.createElement("table");
    // Create table header row using the extracted headers above.
    let tr = table.insertRow(-1); // table row.
    for (let i = 0; i < col.length; i++) {
        let th = document.createElement("th"); // table header.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }
    // add json data to the table as rows.
    for (let i = 0; i < data.length; i++) {
        tr = table.insertRow(-1);
        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = data[i][col[j]];
        }
    }
    // Now, add the newly created table with json data, to a container.
    document.getElementById('content');
    content.innerHTML = "";
    content.appendChild(table);
}
