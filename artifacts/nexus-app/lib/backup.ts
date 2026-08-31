import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKUP_PREFIX = '@nexus/backup/';

export const BackupService = {
  async ensureBackupDir() {
    // AsyncStorage does not require a directory to be created.
  },

  async createBackup(chatData: any) {
    try {
      const timestamp = new Date().toISOString();
      const filename = `backup_${timestamp}.json`;

      const backup = {
        timestamp,
        data: chatData,
        version: '1.0',
      };

      await AsyncStorage.setItem(
        BACKUP_PREFIX + filename,
        JSON.stringify(backup),
      );
      return filename;
    } catch (err) {
      console.error('Backup create error:', err);
      return null;
    }
  },

  async restoreBackup() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const backupFiles = keys
        .filter(key => key.startsWith(BACKUP_PREFIX))
        .map(key => key.slice(BACKUP_PREFIX.length));
      
      if (backupFiles.length === 0) return null;

      const latestFile = backupFiles.sort().reverse()[0];
      const content = await AsyncStorage.getItem(BACKUP_PREFIX + latestFile);
      return content ? JSON.parse(content) : null;
    } catch (err) {
      console.error('Backup restore error:', err);
      return null;
    }
  },

  async listBackups() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(BACKUP_PREFIX))
        .map(key => key.slice(BACKUP_PREFIX.length))
        .sort()
        .reverse();
    } catch (err) {
      return [];
    }
  },

  async deleteBackup(filename: string) {
    try {
      await AsyncStorage.removeItem(BACKUP_PREFIX + filename);
      return true;
    } catch (err) {
      return false;
    }
  },

  async shareBackup() {
    console.warn('Backup paylaşımı bu sürümde cihaz içi yedekle ile sınırlıdır.');
  },

  async autoBackup(chatData: any) {
    return await this.createBackup(chatData);
  },
};
