import { openDB } from 'idb';

const DB_NAME = 'BoxManagerDB';
const DB_VERSION = 1;
const STORE_NAME = 'boxes';

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
};

export const getAllBoxes = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const getBox = async (id) => {
    const db = await initDB();
    return db.get(STORE_NAME, parseInt(id));
};

export const saveBox = async (box) => {
    const db = await initDB();
    return db.put(STORE_NAME, box);
};

export const deleteBox = async (id) => {
    const db = await initDB();
    return db.delete(STORE_NAME, parseInt(id));
};

export const exportData = async () => {
    const boxes = await getAllBoxes();
    const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        boxes
    };
    return JSON.stringify(data, null, 2);
};

export const importData = async (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        if (!data.boxes || !Array.isArray(data.boxes)) throw new Error('Invalid data format');

        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const box of data.boxes) {
            tx.store.put(box);
        }
        await tx.done;
        return true;
    } catch (err) {
        console.error('Import failed:', err);
        return false;
    }
};
