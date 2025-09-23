// Free browser-based photo storage using IndexedDB
export interface Photo {
  id: string;
  imageData: string; // base64 image data
  extractedWords: string[];
  wordsCount: number;
  capturedAt: Date;
  weekStart: Date;
}

class PhotoStorage {
  private dbName = 'RedBootPhotos';
  private version = 1;
  private storeName = 'photos';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create photos store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('capturedAt', 'capturedAt', { unique: false });
          store.createIndex('weekStart', 'weekStart', { unique: false });
        }
      };
    });
  }

  async savePhoto(photo: Omit<Photo, 'id'>): Promise<Photo> {
    if (!this.db) await this.init();

    const photoWithId: Photo = {
      ...photo,
      id: crypto.randomUUID(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(photoWithId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(photoWithId);
    });
  }

  async getAllPhotos(): Promise<Photo[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const photos = request.result.map(photo => ({
          ...photo,
          capturedAt: new Date(photo.capturedAt),
          weekStart: new Date(photo.weekStart),
        }));
        // Sort by newest first
        photos.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
        resolve(photos);
      };
    });
  }

  async getPhotosByWeek(weekStart: Date): Promise<Photo[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('weekStart');
      const request = index.getAll(weekStart);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const photos = request.result.map(photo => ({
          ...photo,
          capturedAt: new Date(photo.capturedAt),
          weekStart: new Date(photo.weekStart),
        }));
        resolve(photos);
      };
    });
  }

  async deletePhoto(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getStorageSize(): Promise<number> {
    const photos = await this.getAllPhotos();
    let totalSize = 0;
    photos.forEach(photo => {
      // Approximate size: base64 string length + metadata
      totalSize += photo.imageData.length + JSON.stringify(photo).length;
    });
    return totalSize;
  }

  async getStorageSizeFormatted(): Promise<string> {
    const size = await this.getStorageSize();
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}

// Export singleton instance
export const photoStorage = new PhotoStorage();

// Calculate week start (Monday of current week)
export function getWeekStart(date: Date = new Date()): Date {
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}