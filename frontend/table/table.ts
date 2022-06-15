// run tsc in this directory to compile to js before testing
const loadButton: HTMLButtonElement = document.getElementById("loader") as HTMLButtonElement
const content: HTMLElement = document.getElementById("content") as HTMLElement
const drop: HTMLSelectElement = document.getElementById("tableOptions") as HTMLSelectElement
let str: string = "";
let count: number = 0
let prevResult: string[] = []

// To load table and generate dropdown
loadButton.addEventListener("click", async () => {
    if (count == 0) {
        fetch('http://localhost:4568/load')
            .then((response: Response) => response.json())
            .then((data: any) => str = JSON.stringify(data))
    }
    await fetch('http://localhost:4568/load')
        .then((response) => response.json())
        .then((data) => str = JSON.stringify(data))
    const withoutFirstAndLast = str.slice(1, -1);
    const newString = withoutFirstAndLast.replace(/"/g, '');
    let result = newString.split(',')
    if (result == prevResult) {
        return
    }
    prevResult = result
    let i, L = drop.options.length - 1;
    for (i = L; i >= 0; i--) {
        drop.remove(i);
    }
    if (drop.length == 0) {
        for (let i = 0; i < result.length; i++) {
            let option = document.createElement("option");
            option.text = result[i]
            option.id = result[i]
            drop.add(option, drop[0])
        }
    }
    const toFetch = "http://localhost:4568/viz?tableName=" + drop.value
    fetch(toFetch)
        .then((response: Response) => response.json())
        .then((data: any) => visualizeData(data))
})

    drop.addEventListener('change', () => {
        console.log('You selected: ', drop.value);
        const toFetch = "http://localhost:4568/viz?tableName=" + drop.value
        fetch(toFetch)
            .then((response: Response) => response.json())
            .then((data: any) => visualizeData(data));
        content.innerHTML = str
    })

function visualizeData (data: any) {
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
    let tr = table.insertRow(-1);                   // table row.

    for (let i = 0; i < col.length; i++) {
        let th = document.createElement("th");      // table header.
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
