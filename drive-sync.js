/**
 * drive-sync.js - نسخة جديدة
 * بيحدث نفس الملف الوحيد: Omar Backup.json
 * مفيش ملفات يومية تاني
 */

const fs = require('fs');
const { google } = require('googleapis');

const FILE_NAME = 'Omar Backup.json';
const FILE_ID = '1d-SvP_ldsgF1GiM6R9HbDN1MX431JzDr'; // الـ ID الرسمي

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  return google.drive({ version: 'v3', auth });
}

/**
 * يحدث نفس الملف فقط - لا ينشئ ملف جديد
 * @param {Object} data - الداتا اللي عايز تحفظها
 */
async function syncBackup(data) {
  const drive = await getDriveClient();
  
  const jsonContent = JSON.stringify(data, null, 2);
  
  // نحدث نفس الملف بالـ ID الثابت - لا بحث ولا انشاء يومي
  await drive.files.update({
    fileId: FILE_ID,
    media: {
      mimeType: 'application/json',
      body: jsonContent
    }
  });
  
  console.log(`✅ تم تحديث ${FILE_NAME} بنجاح - ${new Date().toISOString()}`);
  return FILE_ID;
}

// مثال للاستخدام
async function backupNow() {
  const data = {
    lastSync: new Date().toISOString(),
    // حط الداتا بتاعتك هنا
    data: {}
  };
  
  await syncBackup(data);
}

module.exports = { syncBackup, backupNow, FILE_NAME, FILE_ID };

// لو شغلت الملف مباشرة
if (require.main === module) {
  backupNow().catch(console.error);
}
