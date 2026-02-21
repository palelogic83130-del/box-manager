import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Download, Layout, CheckCircle, Package } from 'lucide-react';
import { Button } from './ui';

import { PRINTER_COLORS as COLORS, CARD_SIZES } from '../constants';

const Printer = ({ boxes, setConfirmDialog }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [orientation, setOrientation] = useState('landscape'); // 'landscape' or 'portrait'
    const [filterColor, setFilterColor] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);

    // Helper to close confirm dialog
    const closeConfirm = () => setConfirmDialog && setConfirmDialog(null);

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(v => v !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const selectAllFiltered = (filteredBoxes) => {
        const filteredIds = filteredBoxes.map(b => b.id);
        const newSelected = Array.from(new Set([...selectedIds, ...filteredIds]));
        setSelectedIds(newSelected);
    };

    const deselectAllFiltered = (filteredBoxes) => {
        const filteredIds = filteredBoxes.map(b => b.id);
        setSelectedIds(selectedIds.filter(id => !filteredIds.includes(id)));
    };

    const generatePDF = async () => {
        if (selectedIds.length === 0) {
            setConfirmDialog && setConfirmDialog({
                title: '선택 항목 없음',
                message: '출력할 상자를 먼저 선택해 주세요.',
                confirmText: '확인',
                onConfirm: closeConfirm
            });
            return;
        }

        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            const isLandscape = orientation === 'landscape';
            const { width, height } = CARD_SIZES[orientation];

            const margin = 10;
            const cols = isLandscape ? 2 : 3;
            const rows = isLandscape ? 4 : 3;

            let currentX = margin;
            let currentY = margin;
            let countInPage = 0;

            const appUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
            const printBoxes = boxes
                .filter(b => selectedIds.includes(b.id))
                .sort((a, b) => a.id - b.id);

            // Create a temporary container for rendering
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            document.body.appendChild(tempContainer);

            for (const box of printBoxes) {
                if (countInPage > 0 && countInPage % (cols * rows) === 0) {
                    doc.addPage();
                    currentX = margin;
                    currentY = margin;
                }

                // Create Card element for html2canvas
                const cardEl = document.createElement('div');
                cardEl.className = `pdf-card ${orientation}`;
                cardEl.style.width = `${width}mm`;
                cardEl.style.height = `${height}mm`;
                cardEl.style.backgroundColor = 'white';
                cardEl.style.position = 'relative';
                cardEl.style.overflow = 'hidden';
                cardEl.style.display = 'flex';
                cardEl.style.flexDirection = 'column';
                cardEl.style.border = '0.1mm dashed #ccc'; // Cutting guide

                // Top Bar
                const topBar = document.createElement('div');
                topBar.style.height = '12mm';
                topBar.style.backgroundColor = box.color || '#3498db';
                topBar.style.width = '100%';
                topBar.style.display = 'flex';
                topBar.style.alignItems = 'center';
                topBar.style.paddingLeft = '5mm';
                topBar.style.color = 'white';
                topBar.style.fontWeight = 'bold';
                topBar.style.fontSize = '14pt';
                topBar.innerText = box.labelTitle || `Box #${box.id}`;
                cardEl.appendChild(topBar);

                // Body content
                const content = document.createElement('div');
                content.style.flex = '1';
                content.style.position = 'relative';
                content.style.display = 'flex';
                content.style.alignItems = 'center';

                const qrValue = `${appUrl}/?id=${box.id}`;
                const qrDataUrl = await QRCode.toDataURL(qrValue, { margin: 1, width: 250 });

                const qrImg = document.createElement('img');
                qrImg.src = qrDataUrl;

                const idText = document.createElement('div');
                idText.innerText = `#${String(box.id).padStart(3, '0')}`;
                idText.style.fontWeight = 'bold';
                idText.style.color = '#333';

                if (isLandscape) {
                    content.style.padding = '0 6mm';
                    content.style.justifyContent = 'space-between';
                    qrImg.style.height = '32mm';
                    idText.style.fontSize = '36pt';
                    content.appendChild(qrImg);
                    content.appendChild(idText);
                } else {
                    content.style.flexDirection = 'column';
                    content.style.justifyContent = 'center';
                    content.style.gap = '5mm';
                    qrImg.style.width = '38mm';
                    idText.style.fontSize = '32pt';
                    content.appendChild(qrImg);
                    content.appendChild(idText);
                }

                cardEl.appendChild(content);
                tempContainer.appendChild(cardEl);

                const canvas = await html2canvas(cardEl, { scale: 3, useCORS: true });
                const imgData = canvas.toDataURL('image/png');

                doc.addImage(imgData, 'PNG', currentX, currentY, width, height);

                tempContainer.removeChild(cardEl);

                countInPage++;
                if (countInPage % cols === 0) {
                    currentX = margin;
                    currentY += height + margin;
                } else {
                    currentX += width + margin;
                }
            }

            document.body.removeChild(tempContainer);
            doc.save(`box_cards_${selectedIds.length}_${orientation}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            setConfirmDialog && setConfirmDialog({
                title: 'PDF 생성 실패',
                message: 'PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.',
                confirmText: '확인',
                onConfirm: closeConfirm
            });
        } finally {
            setIsGenerating(false);
        }

    };

    const filteredBoxes = boxes.filter(box => filterColor === 'all' || box.color === filterColor);

    return (
        <div className="printer-view">
            <section className="welcome">
                <h2>카드 출력 🖨️</h2>
                <p>출력할 상자들을 선택하세요.</p>
            </section>

            <div className="glass-card printing-options">
                <div className="option-row">
                    <label>출력 방향</label>
                    <div className="layout-toggle">
                        <button
                            className={orientation === 'landscape' ? 'active' : ''}
                            onClick={() => setOrientation('landscape')}
                        >가로형</button>
                        <button
                            className={orientation === 'portrait' ? 'active' : ''}
                            onClick={() => setOrientation('portrait')}
                        >세로형</button>
                    </div>
                </div>

                <div className="option-row">
                    <label>색상 필터</label>
                    <div className="color-filter-bar">
                        {COLORS.map(c => (
                            <button
                                key={c.value}
                                className={`filter-chip ${filterColor === c.value ? 'active' : ''}`}
                                onClick={() => setFilterColor(c.value)}
                            >
                                {c.value !== 'all' && (
                                    <span className="dot" style={{ backgroundColor: c.value }}></span>
                                )}
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="option-row">
                    <div className="selection-header">
                        <label>상자 선택 ({selectedIds.length}/{boxes.length})</label>
                        <div className="selection-actions">
                            <Button variant="glass" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => selectAllFiltered(filteredBoxes)}>필터 전체 선택</Button>
                            <Button variant="glass" style={{ padding: '4px 8px', fontSize: '0.7rem', marginLeft: '8px' }} onClick={() => deselectAllFiltered(filteredBoxes)}>선택 해제</Button>
                        </div>
                    </div>

                    <div className="box-listselection">
                        {filteredBoxes.map(box => (
                            <div
                                key={box.id}
                                className={`selection-list-item glass-card ${selectedIds.includes(box.id) ? 'selected' : ''}`}
                                onClick={() => toggleSelection(box.id)}
                            >
                                <div className="item-prefix" style={{ borderLeftColor: box.color || 'var(--accent-blue)' }}>
                                    <Package size={20} color={box.color || 'var(--accent-blue)'} />
                                    <div className="box-titles-mini">
                                        {box.labelTitle && <span className="label-title-mini">{box.labelTitle}</span>}
                                        <span className="box-num">#{box.id}</span>
                                    </div>
                                </div>
                                <div className="item-info">
                                    <span className="items-text">{box.items?.length || 0} 개의 물품</span>
                                </div>
                                <div className="selection-indicator">
                                    {selectedIds.includes(box.id) && <CheckCircle size={20} color="var(--accent-blue)" />}
                                </div>
                            </div>
                        ))}
                        {filteredBoxes.length === 0 && (
                            <p style={{ textAlign: 'center', opacity: 0.5, padding: '40px' }}>
                                {filterColor === 'all' ? '등록된 상자가 없습니다.' : '해당 필터에 맞는 상자가 없습니다.'}
                            </p>
                        )}
                    </div>
                </div>

                <Button onClick={generatePDF} disabled={isGenerating || selectedIds.length === 0} style={{ width: '100%', marginTop: '10px' }}>
                    {isGenerating ? <Layout className="spin" size={20} /> : <Download size={20} />}
                    {isGenerating ? '생성 중...' : '선택한 카드 PDF 저장'}
                </Button>
            </div>

            <div className="preview-info">
                <p>상자에 설정된 고유 색상으로 테두리가 그려집니다.</p>
                <p>포토카드 규격 ({orientation === 'landscape' ? '87x56' : '56x87'}mm)</p>
            </div>
        </div>
    );
};

export default Printer;
