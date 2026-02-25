import React, { useState, useEffect } from 'react'
import { DigitalTasbeeh } from '../../components/tasbeeh/DigitalTasbeeh'
import './TasbeehPage.css'

function getInitialState() {
  if (typeof window === 'undefined') {
    return {
      dailyCount: 0,
      totalCount: 0,
      target: 100,
      streak: 0,
      lastCompletedDate: null,
      customTarget: ''
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const storedDate = localStorage.getItem('tasbeeh-date')
  
  let dailyCount = Number(localStorage.getItem('tasbeeh-daily')) || 0
  let totalCount = Number(localStorage.getItem('tasbeeh-total')) || 0
  let target = Number(localStorage.getItem('tasbeeh-target')) || 100
  let streak = Number(localStorage.getItem('tasbeeh-streak')) || 0
  let lastCompletedDate = localStorage.getItem('tasbeeh-last-completed')

  if (storedDate !== today) {
    dailyCount = 0
    localStorage.setItem('tasbeeh-date', today)
    
    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const lastDateStr = lastDate.toISOString().split('T')[0]
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastDateStr < yesterdayStr) {
        streak = 0
      }
    } else {
      streak = 0
    }
  }

  return { dailyCount, totalCount, target, streak, lastCompletedDate }
}

export function TasbeehPage() {
  const initialState = getInitialState()
  
  const [dailyCount, setDailyCount] = useState(initialState.dailyCount)
  const [totalCount, setTotalCount] = useState(initialState.totalCount)
  const [target, setTarget] = useState(initialState.target)
  const [streak, setStreak] = useState(initialState.streak)
  const [lastCompletedDate, setLastCompletedDate] = useState(initialState.lastCompletedDate)
  const [customTarget, setCustomTarget] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    localStorage.setItem('tasbeeh-daily', dailyCount)
    localStorage.setItem('tasbeeh-total', totalCount)
    localStorage.setItem('tasbeeh-target', target)
    localStorage.setItem('tasbeeh-streak', streak)
    if (lastCompletedDate) {
      localStorage.setItem('tasbeeh-last-completed', lastCompletedDate)
    }
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('tasbeeh-date', today)
  }, [dailyCount, totalCount, target, streak, lastCompletedDate])

  const handleIncrement = () => {
    const newDaily = dailyCount + 1
    setDailyCount(newDaily)
    setTotalCount(prev => prev + 1)

    if (newDaily >= target) {
      const today = new Date().toISOString().split('T')[0]
      
      if (lastCompletedDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (lastCompletedDate === yesterdayStr) {
          setStreak(prev => prev + 1)
        } else {
          setStreak(1)
        }
        setLastCompletedDate(today)
      }
    }
  }

  const handleReset = () => {
    setDailyCount(0)
    setShowResetConfirm(false)
  }

  const handleTargetChange = (newTarget) => {
    setTarget(newTarget)
    setCustomTarget('')
  }

  const handleCustomTarget = (e) => {
    const val = e.target.value
    setCustomTarget(val)
    if (val && !isNaN(val)) {
      setTarget(Number(val))
    }
  }

  return (
    <div className="tasbeeh-page-container">
      <header className="tasbeeh-header">
        <div>
          <h1 className="tasbeeh-title">
            Tasbeeh
          </h1>
          <p className="tasbeeh-subtitle">
            Dhikr & Remembrance
          </p>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Lifetime
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
            {totalCount.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="w-full max-w-md flex flex-col items-center flex-1 justify-center space-y-6" style={{ width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', gap: '1.5rem' }}>
        
        <div className="streak-container">
          <div className="streak-item">
            <span className="streak-value">{streak}</span>
            <span className="streak-label">Streak</span>
          </div>
          <div className="streak-item">
            <span className="streak-value">{dailyCount}</span>
            <span className="streak-label">Today</span>
          </div>
        </div>

        <div style={{ position: 'relative', padding: '0.5rem 0' }}>
          <DigitalTasbeeh 
            count={dailyCount} 
            target={target} 
            onIncrement={handleIncrement} 
            onReset={() => setShowResetConfirm(true)}
          />
        </div>

        <div className="tasbeeh-controls-section">
          <p className="control-label" style={{ textAlign: 'center' }}>
            Daily Goal
          </p>
          <div className="target-presets" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {[33, 100, 300].map(t => (
              <button
                key={t}
                onClick={() => handleTargetChange(t)}
                className={`target-btn ${target === t ? 'active' : ''}`}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: target === t ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid #e2e8f0',
                  backgroundColor: target === t ? '#dbeafe' : 'white',
                  color: target === t ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <input
              type="number"
              placeholder="Custom"
              value={customTarget}
              onChange={handleCustomTarget}
              className="custom-target-input"
              style={{
                width: '8rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                textAlign: 'center',
                backgroundColor: 'white',
                border: (target !== 33 && target !== 100 && target !== 300) ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                color: (target !== 33 && target !== 100 && target !== 300) ? '#1d4ed8' : '#475569',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {showResetConfirm && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
             <div className="modal-content" style={{
               backgroundColor: 'white',
               borderRadius: '1rem',
               padding: '1.5rem',
               width: '90%',
               maxWidth: '20rem',
               boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
             }}>
                <h3 className="modal-title" style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>Reset Daily Count?</h3>
                <p className="modal-text" style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  This will reset your current session count to zero. Your total lifetime count will not be affected.
                </p>
                <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="modal-btn modal-btn-cancel"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#475569',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="modal-btn modal-btn-confirm"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: '#ef4444',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Reset Count
                  </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  )
}
