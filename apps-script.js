// AB Omar - JSON Drive Backup - يحفظ ملف omar-backup.json على Drive مباشرة
function doPost(e) {
  try {
    var payload = e.postData ? e.postData.contents : "";
    if (!payload) {
      return jsonResponse({error: "no data"});
    }
    var data = JSON.parse(payload);
    data.last_sync = new Date().toISOString();
    
    var fileName = "omar-backup.json";
    var content = JSON.stringify(data, null, 2);
    
    var files = DriveApp.getFilesByName(fileName);
    if (files.hasNext()) {
      var file = files.next();
      file.setContent(content);
      Logger.log("Updated: " + fileName);
    } else {
      var newFile = DriveApp.createFile(fileName, content, MimeType.PLAIN_TEXT);
      Logger.log("Created: " + fileName + " ID: " + newFile.getId());
    }
    
    return jsonResponse({success: true, file: fileName, time: data.last_sync});
    
  } catch(err) {
    Logger.log("Error doPost: " + err.message);
    return jsonResponse({error: err.message});
  }
}

function doGet(e) {
  try {
    var fileName = "omar-backup.json";
    var files = DriveApp.getFilesByName(fileName);
    if (!files.hasNext()) {
      return jsonResponse({error: "no backup found - لم يتم العثور على ملف النسخ"});
    }
    var file = files.next();
    var content = file.getBlob().getDataAsString();
    // لو الملف فاضي
    if (!content) return jsonResponse({error: "empty file"});
    
    return ContentService.createTextOutput(content)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    Logger.log("Error doGet: " + err.message);
    return jsonResponse({error: err.message});
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// دالة للتجربة من داخل Apps Script نفسه
function testBackup() {
  var dummy = {daily: [{item:"test"}], tasks: [], backup_date: new Date().toISOString()};
  var files = DriveApp.getFilesByName("omar-backup.json");
  if (files.hasNext()) {
    files.next().setContent(JSON.stringify(dummy, null, 2));
  } else {
    DriveApp.createFile("omar-backup.json", JSON.stringify(dummy, null, 2), MimeType.PLAIN_TEXT);
  }
  Logger.log("test done");
}
