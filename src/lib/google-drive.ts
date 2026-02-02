import { google } from 'googleapis';
import { Readable } from 'stream';
import { prisma } from '@/lib/prisma';

// Get settings from database
async function getGoogleDriveSettings() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          'google_service_account_email', 
          'google_private_key', 
          'google_folder_id',
          'google_client_id',
          'google_client_secret',
          'google_refresh_token'
        ],
      },
    },
  });

  const settingsMap = Object.fromEntries(
    settings.map((s: { key: string; value: string }) => [s.key, s.value])
  );

  return {
    clientEmail: settingsMap['google_service_account_email'] || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: (settingsMap['google_private_key'] || process.env.GOOGLE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
    folderId: extractFileId(settingsMap['google_folder_id'] || process.env.GOOGLE_FOLDER_ID || ''),
    // OAuth 2.0
    clientId: settingsMap['google_client_id'],
    clientSecret: settingsMap['google_client_secret'],
    refreshToken: settingsMap['google_refresh_token'],
  };
}

// Initialize Google Drive client with Service Account or OAuth
async function getDriveClient() {
  const settings = await getGoogleDriveSettings();

  // 1. Try OAuth (Preferred)
  if (settings.clientId && settings.clientSecret && settings.refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      settings.clientId,
      settings.clientSecret
    );
    oauth2Client.setCredentials({
      refresh_token: settings.refreshToken
    });
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  // 2. Fallback to Service Account (Legacy)
  const { clientEmail, privateKey } = settings;
  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials not configured (OAuth or Service Account)');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Extract Google Drive file ID from various URL formats
 * Supports:
 * - gdrive://FILE_ID
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - Just the FILE_ID
 */
export function extractFileId(url: string): string | null {
  if (!url) return null;

  // gdrive:// format
  if (url.startsWith('gdrive://')) {
    return url.replace('gdrive://', '');
  }

  // /file/d/FILE_ID/ format
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return fileMatch[1];
  }

  // /folders/ID format (for folder URLs)
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    return folderMatch[1];
  }

  // ?id=FILE_ID format
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return idMatch[1];
  }

  // If it looks like a raw file ID (alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Get file metadata from Google Drive
 */
export async function getFileMetadata(fileId: string) {
  try {
    const drive = await getDriveClient();
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
    });
    return response.data;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('ไม่สามารถดึงข้อมูลไฟล์ได้');
  }
}

/**
 * Download file from Google Drive and return as stream
 */
export async function downloadFile(fileId: string): Promise<{
  stream: Readable;
  metadata: { name: string; mimeType: string; size: string };
}> {
  try {
    const drive = await getDriveClient();

    // Get file metadata first
    const metaResponse = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
    });

    const metadata = {
      name: metaResponse.data.name || 'download',
      mimeType: metaResponse.data.mimeType || 'application/octet-stream',
      size: metaResponse.data.size || '0',
    };

    // Download file as stream
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return {
      stream: response.data as Readable,
      metadata,
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('ไม่สามารถดาวน์โหลดไฟล์ได้');
  }
}

/**
 * Check if file exists and is accessible
 */
export async function checkFileAccess(fileId: string): Promise<boolean> {
  try {
    const drive = await getDriveClient();
    await drive.files.get({
      fileId,
      fields: 'id',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Upload file to Google Drive
 */
export async function uploadFile(
  file: File, 
  name: string, 
  mimeType: string
): Promise<{ id: string; name: string; mimeType: string }> {
  try {
    const drive = await getDriveClient();
    
    // Create a stream from the file
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Get Folder ID from settings (if configured)
    const { folderId } = await getGoogleDriveSettings();

    const requestBody: any = {
      name,
      mimeType,
    };

    // If folder ID allows specific folder upload
    if (folderId) {
      console.log('Uploading to Google Drive Folder:', folderId);
      requestBody.parents = [folderId];
    } else {
      console.log('Uploading to Google Drive Root (No Folder ID provided)');
    }

    const response = await drive.files.create({
      requestBody,
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, name, mimeType',
      supportsAllDrives: true,
    });

    return {
      id: response.data.id!,
      name: response.data.name!,
      mimeType: response.data.mimeType!,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('ไม่สามารถอัพโหลดไฟล์ได้');
  }
}
