import { useState, useEffect } from 'react';
import { getAllBoxes, saveBox, deleteBox } from '../services/db';

export const useBoxes = () => {
    const [boxes, setBoxes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadBoxes = async () => {
        setIsLoading(true);
        const data = await getAllBoxes();
        setBoxes(data.sort((a, b) => b.id - a.id));
        setIsLoading(false);
    };

    useEffect(() => {
        loadBoxes();
    }, []);

    const addBox = async (box) => {
        await saveBox(box);
        await loadBoxes();
    };

    const removeBox = async (id) => {
        await deleteBox(id);
        await loadBoxes();
    };

    const getBoxById = async (id) => {
        const list = await getAllBoxes();
        return list.find(b => b.id == id);
    };

    return {
        boxes,
        isLoading,
        loadBoxes,
        addBox,
        removeBox,
        getBoxById
    };
};
