// AB Omar - Drive File Backup - V7 - يبحث في كل الملفات المؤرخة
function doPost(e){
  try{
    let dataStr = e.postData.contents;
    let data = JSON.parse(dataStr);
    // لو الداتا فاضية تماما مترفعش (حماية اضافية من جهة السيرفر)
    let isEmpty = (!data.daily || data.daily.length==0) && (!data.tasks || data.tasks.length==0) && (!data.attendance_log || data.attendance_log.length==0) && (!data.attendance || Object.keys(data.attendance).length==0);
    // بس لو جاي من زرار يدوي هنسمح، نعرف من app_version؟ هنسمح دايما بس نسجل
    if(isEmpty){
      // هنحفظه بس مش هنمسح القديم؟ هنحفظه باسم فاضي منفصل
      DriveApp.createFile('AB_Omar_Empty_' + new Date().toISOString() + '.json', dataStr, MimeType.PLAIN_TEXT);
      // لو فاضي مترجعش يمسح الاساسي لو الاساسي فيه داتا كبيرة
      let mainFiles = DriveApp.getFilesByName('AB_Omar_Backup.json');
      if(mainFiles.hasNext()){
        let mainFile = mainFiles.next();
        let mainContent = mainFile.getBlob().getDataAsString();
        if(mainContent.length > 500){ // لو الاساسي فيه داتا كبيرة متسمحوش للفاضي يمسحه
          return ContentService.createTextOutput(JSON.stringify({ok:true, skippedEmpty:true})).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    let fileName = 'AB_Omar_Backup.json';
    let files = DriveApp.getFilesByName(fileName);
    if(files.hasNext()){
      files.next().setContent(dataStr);
    }else{
      DriveApp.createFile(fileName, dataStr, MimeType.PLAIN_TEXT);
    }
    // نسخة يومية
    let dateStr = new Date().toISOString().slice(0,10);
    let backupName = 'AB_Omar_Backup_' + dateStr + '_.json';
    let dayFiles = DriveApp.getFilesByName(backupName);
    if(!dayFiles.hasNext()){
      DriveApp.createFile(backupName, dataStr, MimeType.PLAIN_TEXT);
    }
    // الاسم الصغير
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
    for(let i=0;i<names.length;i++){
      let files = DriveApp.getFilesByName(names[i]);
      if(files.hasNext()){
        let content = files.next().getBlob().getDataAsString();
        if(content && content.length>50){
          let parsed = JSON.parse(content);
          // لو الملف الاساسي فاضي، دور على احدث ملف مؤرخ فيه داتا
          if(!parsed.daily || parsed.daily.length==0){
            // دور على الملفات المؤرخة
            let allFiles = DriveApp.getFiles();
            let bestContent = null;
            let bestLen = 0;
            while(allFiles.hasNext()){
              let f = allFiles.next();
              let n = f.getName();
              if(n.indexOf('AB_Omar_Backup_')==0 && n.indexOf('_.json')>0){
                let c = f.getBlob().getDataAsString();
                if(c.length>bestLen){
                  try{
                    let p = JSON.parse(c);
                    if(p.daily && p.daily.length>0){
                      bestContent=c;
                      bestLen=c.length;
                    }
                  }catch(e){}
                }
              }
            }
            if(bestContent) return ContentService.createTextOutput(bestContent).setMimeType(ContentService.MimeType.JSON);
          }
          return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    // لو ملقاش الاساسي، دور على المؤرخ
    let allFiles = DriveApp.getFiles();
    let bestContent = null;
    let bestLen = 0;
    while(allFiles.hasNext()){
      let f = allFiles.next();
      let n = f.getName();
      if(n.indexOf('AB_Omar_Backup_')==0){
        let c = f.getBlob().getDataAsString();
        if(c.length>bestLen){
          try{ let p=JSON.parse(c); if(p.daily && p.daily.length>0){bestContent=c; bestLen=c.length;}}catch(e){}
        }
      }
    }
    if(bestContent) return ContentService.createTextOutput(bestContent).setMimeType(ContentService.MimeType.JSON);
    
    return ContentService.createTextOutput(JSON.stringify({error: 'No backup found'})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
