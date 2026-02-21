import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Modal, Button, Input } from './ui';
import { COLORS } from '../constants';

const BoxDetail = ({ box, onSave, onDelete, onClose }) => {
    const [labelTitle, setLabelTitle] = useState(box.labelTitle || '');
    const [items, setItems] = useState(box.items || []);
    const [color, setColor] = useState(box.color || COLORS[0].value);
    const [newItemName, setNewItemName] = useState('');

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        const newItem = { name: newItemName.trim(), addedAt: new Date().toISOString() };
        setItems([...items, newItem]);
        setNewItemName('');
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave({ ...box, labelTitle, items, color });
    };

    const footer = (
        <>
            <Button variant="danger" onClick={() => onDelete(box.id)}>
                <Trash2 size={20} /> 상자 삭제
            </Button>
            <Button variant="primary" onClick={handleSave}>
                <Save size={20} /> 저장하기
            </Button>
        </>
    );

    return (
        <Modal
            title={`상자 #${box.id}`}
            subtitle={`${items.length} 개의 물품`}
            onClose={onClose}
            footer={footer}
        >
            <div className="box-settings-row">
                <label>라벨 이름 (예: 겨울 옷, 공구함)</label>
                <Input
                    type="text"
                    placeholder="상자 이름을 입력하세요..."
                    value={labelTitle}
                    onChange={(e) => setLabelTitle(e.target.value)}
                />
            </div>

            <div className="box-settings-row">
                <label>상자 고유 색상</label>
                <div className="palette-row">
                    {COLORS.map(c => (
                        <button
                            key={c.value}
                            className={`palette-btn ${color === c.value ? 'active' : ''}`}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setColor(c.value)}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>

            <form onSubmit={handleAddItem} className="add-item-form">
                <Input
                    icon={Plus}
                    type="text"
                    placeholder="새 물품 추가..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                />
                <input type="submit" hidden />
            </form>

            <ul className="item-list">
                {items.map((item, index) => (
                    <li key={index} className="item-row glass-card">
                        <span>{item.name}</span>
                        <button className="delete-item-btn" onClick={() => handleRemoveItem(index)}>
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
                {items.length === 0 && <li className="empty-list">물품을 추가해 주세요.</li>}
            </ul>
        </Modal>
    );
};

export default BoxDetail;
