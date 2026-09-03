// AB Omar - Drive File Backup - JSON - نهائي
function doPost(e){
  try{
    let dataStr = e.postData.contents;
    let fileName = 'AB_Omar_Backup.json';
    let files = DriveApp.getFilesByName(fileName);
    if(files.hasNext()){
      files.next().setContent(dataStr);
    }else{
      DriveApp.createFile(fileName, dataStr, MimeType.PLAIN_TEXT);
    }
    let smallFiles = DriveApp.getFilesByName('omar-backup.json');
    if(smallFiles.hasNext()){
      smallFiles.next().setContent(dataStr);
    }else{
      DriveApp.createFile('omar-backup.json', dataStr, MimeType.PLAIN_TEXT);
    }
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet(){
  try{
    let names = ['AB_Omar_Backup.json', 'omar-backup.json'];
    for(let i=0; i<names.length; i++){
      let files = DriveApp.getFilesByName(names[i]);
      if(files.hasNext()){
        let content = files.next().getBlob().getDataAsString();
        if(content) return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({error: 'No backup found'})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
