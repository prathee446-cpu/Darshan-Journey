import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Sparkles, 
  Flame, 
  Info, 
  X, 
  CheckCircle2,
  Building2,
  Sun,
  Moon,
  Star,
  Award
} from 'lucide-react';
import { getMonthGridDays, getCalendarDataForDate } from '../services/panchangService';
import { REAL_TAMIL_NADU_TEMPLES } from '../services/templeDataService';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function TempleCalendar({ onBookPooja }) {
  // Real-time automatic date initialization using local Date API
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTemple, setSelectedTemple] = useState('all');

  // Side drawer panel visibility
  const [isPanelOpen, setIsPanelOpen] = useState(true); // Open by default for instant delight

  const calendarContainerRef = useRef(null);

  // Keyboard ESC key listener to close side panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setIsPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync grid days whenever month, year, selected date, or temple filter changes
  const gridDays = getMonthGridDays(currentYear, currentMonth, selectedDate, selectedTemple);

  // Selected date Panchang details
  const selectedPanchang = getCalendarDataForDate(selectedDate, selectedTemple);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now);
    setIsPanelOpen(true);
  };

  const handleDayClick = (dayItem) => {
    setSelectedDate(dayItem.dateObj);
    // If clicked day is from prev/next month, auto-shift month
    if (dayItem.dateObj.getMonth() !== currentMonth) {
      setCurrentMonth(dayItem.dateObj.getMonth());
      setCurrentYear(dayItem.dateObj.getFullYear());
    }
    // Open side panel smoothly
    setIsPanelOpen(true);
  };

  return (
    <div className="temple-calendar-wrapper" ref={calendarContainerRef}>
      {/* ---------------- CALENDAR HEADER BAR ---------------- */}
      <div className="calendar-top-toolbar">
        {/* Left: Temple Filter Selector */}
        <div className="calendar-filter-box">
          <label className="filter-label-inline">
            <Building2 size={16} style={{ color: '#C8A96A' }} /> Select Temple:
          </label>
          <select 
            className="calendar-temple-select"
            value={selectedTemple}
            onChange={(e) => setSelectedTemple(e.target.value)}
          >
            <option value="all">✨ All Temples & Panchang</option>
            {REAL_TAMIL_NADU_TEMPLES.map(t => (
              <option key={t.id} value={t.name}>🛕 {t.name}</option>
            ))}
          </select>
        </div>

        {/* Center/Right: Month Navigation & Today Button */}
        <div className="calendar-nav-group">
          <button className="btn-today-chip" onClick={handleTodayClick} title="Jump to Today's Date">
            Today
          </button>

          <div className="month-nav-controls">
            <button className="month-nav-btn" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={20} />
            </button>
            <h3 className="current-month-display">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button className="month-nav-btn" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- SIDE-BY-SIDE SPLIT LAYOUT (DESKTOP: GRID + DRAWER) ---------------- */}
      <div className={`calendar-split-container ${isPanelOpen ? 'panel-expanded' : 'panel-collapsed'}`}>
        
        {/* LEFT COLUMN: 7-COLUMN GOOGLE/APPLE STYLE CALENDAR GRID */}
        <div className="calendar-grid-card">
          {/* Weekday Headers */}
          <div className="calendar-weekdays-row">
            {WEEKDAY_NAMES.map(wd => (
              <div key={wd} className="weekday-cell">{wd}</div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="calendar-days-grid">
            {gridDays.map((dayItem, idx) => {
              const { dayNum, isCurrentMonth, isToday, isSelected, panchang } = dayItem;
              const hasEvents = panchang.events && panchang.events.length > 0;

              return (
                <div
                  key={idx}
                  className={`calendar-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today-cell' : ''} ${isSelected ? 'selected-cell' : ''} ${hasEvents ? 'has-event-cell' : ''}`}
                  onClick={() => handleDayClick(dayItem)}
                >
                  {/* Day Header: Number + Today Badge */}
                  <div className="day-cell-top">
                    <span className={`day-number ${isToday ? 'today-badge' : ''}`}>
                      {dayNum}
                    </span>
                    {isToday && <span className="today-label-tag">TODAY</span>}
                  </div>

                  {/* Panchang Badges & Indicators */}
                  <div className="day-cell-content">
                    {panchang.tamilLabel && isCurrentMonth && (
                      <span className="day-tamil-date">{panchang.tamilLabel}</span>
                    )}

                    <div className="day-badges-stack">
                      {panchang.badges.map((b, bIdx) => (
                        <span key={bIdx} className={`mini-badge-chip ${b.type}`}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BACKDROP FOR MOBILE */}
        {isPanelOpen && (
          <div className="calendar-drawer-backdrop" onClick={() => setIsPanelOpen(false)} />
        )}

        {/* RIGHT COLUMN: ELEGANT SIDE PANEL / DRAWER */}
        <div className={`calendar-side-panel ${isPanelOpen ? 'open' : 'closed'}`}>
          {/* Side Panel Header */}
          <div className="panel-header">
            <div>
              <span className="panel-tag">📅 SELECTED DATE DETAILS</span>
              <h3 className="panel-date-heading">
                {selectedPanchang.dayName}, {selectedPanchang.formattedDate}
              </h3>
            </div>

            <button className="panel-close-btn" onClick={() => setIsPanelOpen(false)} title="Close Panel (ESC)">
              <X size={20} />
            </button>
          </div>

          {/* Panchang Summary Pill Cards */}
          <div className="panel-panchang-card">
            <div className="panchang-row">
              <div className="panchang-item">
                <span className="panchang-item-label">🌺 Tamil Month & Day</span>
                <span className="panchang-item-val">{selectedPanchang.tamilLabel}</span>
              </div>
              <div className="panchang-item">
                <span className="panchang-item-label">🌙 Tithi & Paksha</span>
                <span className="panchang-item-val">{selectedPanchang.tithiName} ({selectedPanchang.paksha})</span>
              </div>
            </div>

            {selectedPanchang.badges.length > 0 && (
              <div className="panel-badges-flex">
                {selectedPanchang.badges.map((b, bIdx) => (
                  <span key={bIdx} className={`panel-badge-pill ${b.type}`}>
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Event Cards Section */}
          <div className="panel-events-scrollable">
            <h4 className="panel-section-title">
              🛕 Scheduled Temple Events & Poojas
            </h4>

            {selectedPanchang.events.length > 0 ? (
              <div className="panel-events-stack">
                {selectedPanchang.events.map((evt, evtIdx) => (
                  <div key={evtIdx} className="side-event-card">
                    <div className="side-event-top">
                      <h4 className="side-event-name">🎉 {evt.name}</h4>
                      <span className="side-temple-badge">🛕 {evt.templeName}</span>
                    </div>

                    <div className="side-event-meta">
                      <div className="meta-line">
                        <Clock size={15} style={{ color: '#C8A96A', flexShrink: 0 }} />
                        <span>Timings: {evt.startTime} – {evt.endTime}</span>
                      </div>
                      <div className="meta-line">
                        <MapPin size={15} style={{ color: '#C8A96A', flexShrink: 0 }} />
                        <span>Location: {evt.location}</span>
                      </div>
                    </div>

                    <p className="side-event-desc">{evt.description}</p>

                    {evt.specialNotes && (
                      <div className="side-special-notes">
                        <Info size={15} style={{ color: '#C8A96A', flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>Notes:</strong> {evt.specialNotes}</span>
                      </div>
                    )}

                    <button 
                      className="btn-primary side-book-btn"
                      onClick={() => {
                        if (onBookPooja) onBookPooja(evt.templeName);
                      }}
                    >
                      Book Special Pooja <CheckCircle2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Strict Empty State when no events exist for date */
              <div className="side-panel-empty-card">
                <div className="empty-symbol">🙏</div>
                <h4 className="empty-heading">No special events scheduled for this date.</h4>
                <p className="empty-text">
                  Routine temple darshan, Archana, and daily Abhishekams take place normally.
                </p>
                {onBookPooja && (
                  <button 
                    className="btn-outline side-book-btn"
                    style={{ marginTop: '0.8rem' }}
                    onClick={() => {
                      onBookPooja(selectedTemple !== 'all' ? selectedTemple : '');
                    }}
                  >
                    Book General Darshan Pass
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
