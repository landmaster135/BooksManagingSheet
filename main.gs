function listFormated(listReadFromGss) {
  var listFormated = [];
  for (let j = 0; j < listReadFromGss.length; j++) {
    // "if" statement in one liner. If '', nothing to do.
    listReadFromGss[j][0]=='' ? true : listFormated.push(listReadFromGss[j][0]);
  }
  return listFormated
}

/**
 * Get number of record in Google Spreadsheet.
 *
 * @param {"bookmarkSites"} sheetName - Name of sheet that you wanna know number of record.
 * @return {number} Number of record
 * @customfunction
 */
function get_row_to_read_actual_in_GSS(sheetName) {
  // declare list for warning message.
  let warningMessage = 'Warning: Number of row passing over \"row_to_read\". Tweak me.';
  let errorMessage   = 'RowIndexOutOfBoundsError: Number of row reached \"row_to_read\". Tweak me.';

  // declare variables for row and column index.
  let column_for_id = 1;
  let row_to_read = 500;

  // declare list.
  let idList;

  // get sheet.
  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  // memorize number of row to read
  console.time(`SELECT TOP ${row_to_read - 1} id FROM \'${sheetName}\'`);
  idList = sheet.getRange(2, column_for_id, row_to_read - 1, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read - 1} id FROM \'${sheetName}\'`);
  idList_formated = listFormated(idList);
  
  // warning message. If condition is false, nothing to do.
  let row_to_read_actual = Number(idList_formated.reduce((a,b)=>Math.max(a,b)));
  row_to_read - row_to_read_actual <= 2 ? console.warn(warningMessage) : false;
  if(row_to_read_actual >= row_to_read - 1){
    console.error(errorMessage);
    return 0;
  }
  return row_to_read_actual;
}

function saveImageFromUrl(urlList){  
  // get sheet.
  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEET_NAME_3RD);
  let row_to_read_actual = get_row_to_read_actual_in_GSS(SHEET_NAME_3RD);
  let bookList = [];

  console.time(`SELECT TOP ${row_to_read_actual - 1} * FROM \'${SHEET_NAME_3RD}\'`);
  bookList = sheet.getRange(2, COLUMN_INDEX_OF_ID_IN_THE_SHEET, row_to_read_actual,COLUMN_INDEX_OF_IMAGE_URL_DOWNLOADED).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read_actual - 1} * FROM \'${SHEET_NAME_3RD}\'`);

  let image;
  let outputFileId;
  let outputFolder = DriveApp.getFolderById(FOLDER_ID_STORING_IMAGES);
  let outputFolderName = outputFolder.getName();
  let outputFileIdList = [];

  console.time(`Files were Created in \'${outputFolderName}\'. `);
  bookList.forEach(row => {
    image = UrlFetchApp.fetch(row[COLUMN_INDEX_OF_IMAGE_URL_DOWNLOADED - GAP_BETWEEN_ARRAY_INDEX_AND_SHEET_ROW]).getBlob();
    outputFileId = outputFolder.createFile(image).getId();
    console.info(`File was Cradted to \'${outputFileId}\'.`);
    outputFileIdList.push([outputFileId]);
  });
  console.timeEnd(`Files were Created in \'${outputFolderName}\'. `);

  console.time(`UPDATE \'${SHEET_NAME_3RD}\' SET toDlImageUrl *`);
  bookList = sheet.getRange(2, COLUMN_INDEX_OF_IMAGE_ID_STORED, row_to_read_actual, 1).setValues(outputFileIdList);
  console.timeEnd(`UPDATE \'${SHEET_NAME_3RD}\' SET toDlImageUrl *`);
}

