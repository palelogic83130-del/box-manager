import { useState, useRef, useEffect } from 'react'
import { Package, Search, QrCode, Settings, Plus, Download, Upload, RefreshCw } from 'lucide-react'
import { exportData, importData } from './services/db'
import { DEFAULT_BOX_COLOR, DB_NAME } from './constants'
import { useBoxes } from './hooks/useBoxes'

import BoxCard from './components/BoxCard'
import BoxDetail from './components/BoxDetail'
import Scanner from './components/Scanner'
import Printer from './components/Printer'
import { Button, Input } from './components/ui'
import './App.css'

function App() {
    const [activeTab, setActiveTab] = useState('home')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBox, setSelectedBox] = useState(null)
    const [showScanner, setShowScanner] = useState(false)
    const { boxes, isLoading, loadBoxes, addBox, removeBox, getBoxById } = useBoxes()
    const fileInputRef = useRef(null)

    // Handle deep linking (e.g., ?id=1) on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const id = params.get('id')
        if (id) {
            const checkAndOpen = async () => {
                const box = await getBoxById(id)
                if (box) {
                    setSelectedBox(box)
                }
            }
            checkAndOpen()
        }
    }, [isLoading]) // Depend on isLoading to ensure data might be ready

    const handleSaveBox = async (box) => {
        await addBox(box)
        setSelectedBox(null)
    }

    const handleDeleteBox = async (id) => {
        if (confirm('정말 이 상자를 삭제할까요?')) {
            await removeBox(id)
            setSelectedBox(null)
        }
    }

    const handleAddNewBox = () => {
        const maxId = boxes.length > 0 ? Math.max(...boxes.map(b => b.id)) : 0
        setSelectedBox({ id: maxId + 1, items: [], color: DEFAULT_BOX_COLOR })
    }

    const checkCameraAvailability = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            return devices.some(device => device.kind === 'videoinput')
        } catch (e) {
            return false
        }
    }

    const handleOpenScanner = async () => {
        const hasCamera = await checkCameraAvailability()
        if (hasCamera) {
            setShowScanner(true)
        } else {
            alert('연결된 카메라를 찾을 수 없습니다. 카메라가 있는 기기에서 사용해 주세요! 📷')
        }
    }

    const handleScan = async (id) => {
        setShowScanner(false)
        const box = await getBoxById(id)
        if (box) {
            setSelectedBox(box)
        } else {
            if (confirm(`상자 #${id} 가 없습니다. 새로 만들까요?`)) {
                setSelectedBox({ id: parseInt(id), items: [], color: DEFAULT_BOX_COLOR })
            }
        }
    }

    const handleExport = async () => {
        const data = await exportData()
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `box-manager-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
    }

    const handleImport = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = async (event) => {
            const success = await importData(event.target.result)
            if (success) {
                alert('데이터를 성공적으로 불러왔습니다.')
                loadBoxes()
            } else {
                alert('데이터 불러오기에 실패했습니다.')
            }
        }
        reader.readAsText(file)
    }

    const filteredBoxes = boxes.filter(box =>
        box.id.toString().includes(searchQuery) ||
        box.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="app-container">
            <header className="glass-header">
                <h1>Box Manager</h1>
                {activeTab === 'home' && (
                    <Input
                        icon={Search}
                        type="text"
                        placeholder="상자 번호 또는 물품 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}
            </header>

            <main className="content">
                {activeTab === 'home' && (
                    <div className="home-view">
                        <section className="welcome">
                            <h2>내 보관함 📦</h2>
                            <Button className="add-new-btn" onClick={handleAddNewBox}>
                                <Plus size={20} /> 새 상자 추가
                            </Button>
                        </section>

                        <div className="box-grid">
                            {filteredBoxes.map(box => (
                                <BoxCard key={box.id} box={box} onClick={setSelectedBox} />
                            ))}
                            {!isLoading && filteredBoxes.length === 0 && (
                                <p className="empty-state">검색 결과가 없거나 등록된 상자가 없습니다.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'print' && <Printer boxes={boxes} />}

                {activeTab === 'settings' && (
                    <div className="settings-view">
                        <h2>설정 ⚙️</h2>
                        <div className="glass-card settings-card">
                            <h3>데이터 관리</h3>
                            <p className="hint">브라우저에 저장된 데이터를 백업하거나 복구하세요.</p>
                            <div className="action-buttons">
                                <Button variant="glass" className="settings-btn" onClick={handleExport}>
                                    <Download size={20} /> 데이터 내보내기 (.json)
                                </Button>

                                <Button variant="glass" className="settings-btn" onClick={() => fileInputRef.current?.click()}>
                                    <Upload size={20} /> 데이터 불러오기
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    onChange={handleImport}
                                    accept=".json"
                                />

                                <Button variant="danger" className="settings-btn" onClick={() => {
                                    if (confirm('모든 데이터를 삭제할까요?')) {
                                        indexedDB.deleteDatabase(DB_NAME)
                                        window.location.reload()
                                    }
                                }}>
                                    <RefreshCw size={20} /> 전체 초기화
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <nav className="glass-nav">
                <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
                    <Package size={24} />
                    <span>목록</span>
                </button>
                <button className={activeTab === 'print' ? 'active' : ''} onClick={() => setActiveTab('print')}>
                    <RefreshCw size={24} />
                    <span>출력</span>
                </button>
                <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                    <Settings size={24} />
                    <span>설정</span>
                </button>
            </nav>

            <div className="floating-scan">
                <button className="scan-btn" onClick={handleOpenScanner}>
                    <QrCode size={32} />
                </button>
            </div>

            {showScanner && (
                <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            )}

            {selectedBox && (
                <BoxDetail
                    box={selectedBox}
                    onSave={handleSaveBox}
                    onDelete={handleDeleteBox}
                    onClose={() => setSelectedBox(null)}
                />
            )}
        </div>
    )
}

export default App
