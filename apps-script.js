/**
 * apps-script.js - نسخة جديدة
 * بيكتب في ملف JSON فقط - لا يكتب في شيت نهائيا
 * يحدث نفس الملف: Omar Backup.json
 */

const FILE_NAME = 'Omar Backup.json';
const FILE_ID = '1d-SvP_ldsgF1GiM6R9HbDN1MX431JzDr'; // الـ ID الرسمي الوحيد

/**
 * يجيب الملف الرسمي
 */
function getBackupFile() {
  try {
    return DriveApp.getFileById(FILE_ID);
  } catch (e) {
    // لو الـ ID مش موجود لأي سبب، دور بالاسم
    const files = DriveApp.getFilesByName(FILE_NAME);
    if (files.hasNext()) {
      return files.next();
    }
    // لو مش موجود خالص، انشئه
    return DriveApp.createFile(FILE_NAME, '{}', MimeType.PLAIN_TEXT);
  }
}

/**
 * يكتب / يحدث البيانات في الـ JSON فقط
 * @param {Object} newData - البيانات الجديدة
 */
function saveToJson(newData) {
  const file = getBackupFile();
  
  let existingData = {};
  try {
    const content = file.getBlob().getDataAsString();
    if (content && content.trim()) {
      existingData = JSON.parse(content);
    }
  } catch (e) {
    existingData = {};
  }
  
  // دمج البيانات الجديدة مع القديمة
  const mergedData = {
    ...existingData,
    ...newData,
    lastUpdated: new Date().toISOString()
  };
  
  file.setContent(JSON.stringify(mergedData, null, 2));
  
  Logger.log('✅ تم التحديث في ' + FILE_NAME);
  return mergedData;
}

/**
 * يضيف عنصر جديد للمصفوفة في الـ JSON
 * مثال: لو عندك قائمة عملاء او اوردرات
 */
function appendToJsonArray(key, item) {
  const file = getBackupFile();
  
  let data = {};
  try {
    data = JSON.parse(file.getBlob().getDataAsString() || '{}');
  } catch (e) {
    data = {};
  }
  
  if (!Array.isArray(data[key])) {
    data[key] = [];
  }
  
  data[key].push({
    ...item,
    _addedAt: new Date().toISOString()
  });
  
  data.lastUpdated = new Date().toISOString();
  
  file.setContent(JSON.stringify(data, null, 2));
  Logger.log('✅ تم اضافة عنصر جديد لـ ' + key);
  return data;
}

/**
 * يجيب البيانات الحالية من الـ JSON
 */
function getJsonData() {
  const file = getBackupFile();
  try {
    return JSON.parse(file.getBlob().getDataAsString() || '{}');
  } catch (e) {
    return {};
  }
}

// للـ Web App - يستقبل POST ويكتب في JSON فقط
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const result = saveToJson(payload);
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة للاختبار
function testSave() {
  saveToJson({
    message: "هذا اختبار - الكتابة في JSON فقط",
    test: true
  });
}
