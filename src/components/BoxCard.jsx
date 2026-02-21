import React from 'react';
import { Package, ChevronRight } from 'lucide-react';

const BoxCard = ({ box, onClick }) => {
    return (
        <div className="glass-card box-card" onClick={() => onClick(box)}>
            <div className="box-header" style={{ borderLeftColor: box.color || 'var(--accent-blue)' }}>
                <Package size={24} color={box.color || 'var(--accent-blue)'} />
                <div className="box-titles">
                    {box.labelTitle && <span className="label-title-text">{box.labelTitle}</span>}
                    <span className="box-id">#{box.id}</span>
                </div>
            </div>
            <div className="box-content">
                <p className="item-count">{box.items?.length || 0} 개의 물품</p>
                <div className="item-preview">
                    {box.items?.slice(0, 3).map((item, i) => (
                        <span key={i} className="item-tag">{item.name}</span>
                    )) || <span className="empty-text">비어 있음</span>}
                    {(box.items?.length > 3) && <span className="more-text">...</span>}
                </div>
            </div>
            <ChevronRight className="arrow" size={20} />
        </div>
    );
};

export default BoxCard;
