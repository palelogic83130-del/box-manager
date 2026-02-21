import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Modal, Button, Input } from './ui';
import { COLORS } from '../constants';

const BoxDetail = ({ box, onSave, onDelete, onClose }) => {
    const isNew = box._isNew;
    const [activeTab, setActiveTab] = useState(box.items && box.items.length > 0 ? 'items' : 'settings');
    const [labelTitle, setLabelTitle] = useState(box.labelTitle || '');
    const [items, setItems] = useState(box.items || []);
    const [color, setColor] = useState(box.color || COLORS[0].value);
    const [newItemName, setNewItemName] = useState('');

    const handleAddItem = (e) => {
        if (e) e.preventDefault();
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
        <div className="modal-footer-actions" style={{ display: 'flex', width: '100%' }}>
            <Button
                variant="primary"
                onClick={handleSave}
                style={{ flex: 1 }}
            >
                <Save size={20} /> {isNew ? '상자 생성하기' : '저장'}
            </Button>
        </div>
    );

    return (
        <Modal
            title={isNew ? '새 상자 추가' : `상자 #${box.id}`}
            subtitle={isNew ? '상자 정보를 입력해 주세요.' : `${items.length} 개의 물품`}
            onClose={onClose}
            footer={footer}
        >
            <div className="detail-tabs">
                <button
                    className={activeTab === 'items' ? 'active' : ''}
                    onClick={() => setActiveTab('items')}
                >물품 관리</button>
                <button
                    className={activeTab === 'settings' ? 'active' : ''}
                    onClick={() => setActiveTab('settings')}
                >상자 설정</button>
            </div>

            {activeTab === 'settings' ? (
                <div className="settings-tab-content">
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

                    {!isNew && (
                        <div className="danger-zone">
                            <p className="hint">상자를 영구적으로 삭제합니다.</p>
                            <Button variant="danger" onClick={() => onDelete(box.id)} style={{ width: '100%' }}>
                                <Trash2 size={20} /> 이 상자 삭제하기
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="items-tab-content">
                    <form onSubmit={handleAddItem} className="add-item-form-row">
                        <div className="input-with-btn">
                            <Input
                                type="text"
                                placeholder="새 물품 추가..."
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                            />
                            <Button type="submit" variant="primary" onClick={handleAddItem} style={{ padding: '12px' }}>
                                <Plus size={24} />
                            </Button>
                        </div>
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
                </div>
            )}
        </Modal>
    );
};

export default BoxDetail;
