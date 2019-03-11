function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function migrateSpreadsheet(formObject) {
  var spreadsheet = SpreadsheetApp.openByUrl(formObject.feedbackSpreadsheetURL);
  var responsesSheet = spreadsheet.getSheetByName('Raw Form Responses');
  
  cloneResponsesSheet(formObject.feedbackSpreadsheetURL);

  migrateResponsesSheet(spreadsheet, responsesSheet, formObject.migrationJSON);
  
  SpreadsheetApp.flush();
  
  return "WE DID IT!";
}

function cloneResponsesSheet(feedbackSpreadsheetURL) {
  var spreadsheet = SpreadsheetApp.openByUrl(feedbackSpreadsheetURL);
  var responsesSheet = spreadsheet.getSheetByName('Raw Form Responses');
  
  if(spreadsheet.getSheetByName('OLD Raw Form Responses') != null) {
    var error = "'OLD Raw Form Responses' already exists. Exiting.";
    console.log(error);
    return error;
  }
  
  var responsesSheetClone = responsesSheet.copyTo(spreadsheet);
  responsesSheetClone.setName("OLD Raw Form Responses");
}

function migrateResponsesSheet(spreadsheet, responsesSheet, migrationJSON) {
  var range = responsesSheet.getDataRange();
  var values = range.getValues();
  var headers = values[0];
  var parsedMigrationFile = JSON.parse(migrationJSON);
  
  for (var columnToMigrate in parsedMigrationFile) {
    var columnIndex = -1;
    if (parsedMigrationFile.hasOwnProperty(columnToMigrate)) {
      var headerToMigrate = columnToMigrate.split("~")[1];
      var breakDownSheetName = columnToMigrate.split("~")[0].replace("_", " ");
      var newHeaderValue = parsedMigrationFile[columnToMigrate];
      for(var i = 0; i < headers.length; i++) {
        if(headers[i] === headerToMigrate) {
          columnIndex = i;
          break;
        }
      }
      if(columnIndex > -1) {
        var headerRange = responsesSheet.getRange(1, columnIndex+1);
        headerRange.setValue(newHeaderValue);
        
        // migrate breakdown page
        console.log("Migrating break down sheet " + breakDownSheetName);
        var breakDownSheet = spreadsheet.getSheetByName(breakDownSheetName);
        var columnWithQuestions = [];      
        var breakDownSheetValues = breakDownSheet.getDataRange().getValues();
        for(var j = 0; j < breakDownSheetValues.length; j++) {
          columnWithQuestions[j] = breakDownSheetValues[j][0];
        }
        for(var j = 0; j < columnWithQuestions.length; j++) {
          console.log("Looking for a match for " + columnWithQuestions[j]);
        if(columnWithQuestions[j] === headerToMigrate) {
          console.log("Changing break down page to have header value " + columnWithQuestions[j]);
          var cellToChange = breakDownSheet.getRange(j+1, 1);
          cellToChange.setValue(newHeaderValue);
          break;
        }
      }        
    } else {
        console.log("Did not find " + columnToMigrate);
    }
   }
  }
}
