// @ts-nocheck



export async function getSpreadsheet(spreadsheetId) {
    var response = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        includeGridData: true,
    });

    return response.result;
}

export async function getValuesFromRange(spreadsheetId, range) {
    var response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    });

    return response.result.values;
}

export function listSheets(spreadsheet) {
    var sheetsList = [];
    if (!spreadsheet || Object.keys(spreadsheet).length === 0) {
        console.log('No spreadsheet selected');
        return;
    }
    if (spreadsheet.sheets.length > 0) {
        for (var i = 0; i < spreadsheet.sheets.length; i++) {
            var sheetName = spreadsheet.sheets[i].properties.title;
            sheetsList.push(sheetName);
        }

    } else {
        console.log('No sheets found');
    }

    return sheetsList;

}

export function getSpreadsheetName(spreadsheet) {
    if (!spreadsheet || Object.keys(spreadsheet).length === 0) {
        console.log('No spreadsheet selected: can\'t get spreadsheet name');
        return;
    }
    return spreadsheet.properties.title;

}

export function getSpreadsheetId(spreadsheet) {
    if (!spreadsheet || Object.keys(spreadsheet).length === 0) {
        console.log('No spreadsheet selected: can\'t get spreadsheet id');
        return;
    }
    return spreadsheet.spreadsheetId;
}

export function getSpreadsheetLink(spreadsheet) {
    if (!spreadsheet || Object.keys(spreadsheet).length === 0) {
        console.log('No spreadsheet selected: can\'t get spreadsheet link');
        return;
    }
    return spreadsheet.spreadsheetUrl;
}

export function getHeadings(spreadsheet, sheetName) {
    if (!spreadsheet || Object.keys(spreadsheet).length === 0) {
        console.log('No spreadsheet selected: can\'t get headings');
        return;
    }

    var selectedSheet = spreadsheet.sheets.find(el => el.properties.title === sheetName);

    //find the first non-empty row
    var firstRow = selectedSheet.data[0].rowData.find(
        el => Object.keys(el).length !== 0
    );

    var values = [];
    for (var i in firstRow.values) {
        values.push({
            index: i,
            column: columnToLetter(i),
            value: firstRow.values[i]?.formattedValue,
            checked: true,
        });

    }
    return values;
}

export function getSheetRange(spreadsheet, sheetName) {
    if (!spreadsheet || Object.keys(spreadsheet).length === 0) {
        console.log('No spreadsheet selected');
        return;
    }

    let selectedSheet = spreadsheet.sheets.find(el => el.properties.title === sheetName);

    let maxCol = selectedSheet.properties.gridProperties.columnCount;
    let maxColLetter = columnToLetter(maxCol);

    let range = sheetName + '!A:' + maxColLetter;
    return range;
}

function listAge() {
    window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Written Review!A2:AL',
    }).then(function (response) {
        var range = response.result;
        var newAges = ages;
        if (range.values.length > 0) {
            newAges.push('Name, Age:');
            for (var i = 0; i < 5; i++) {
                var row = range.values[i];
                // Print columns A and E, which correspond to indices 0 and 4.
                newAges.push(row[2] + ', ' + row[4]);
            }
            setAges(newAges);
            setLoaded(true);
        } else {
            console.log('No data found.');
        }
    }, function (response) {
        console.log('Error: ' + response.result.error.message);
    });
}


/**
 * Functions to log in
 */


/**
 * Help functions to change between different formats
 */
function columnToLetter(column) {
    var temp, letter = '';
    column++;
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

function letterToColumn(letter) {
    var column = 0, length = letter.length;
    for (var i = 0; i < length; i++) {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column - 1;
}