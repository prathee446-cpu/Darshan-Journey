import React, { useState, useEffect } from 'react';

export default function DateTimeWidget() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <div className="global-datetime-widget" aria-label="Current Date and Time">
      <div className="datetime-row">
        <span className="datetime-label">Date:</span>
        <span className="datetime-value">{formatDate(dateTime)}</span>
      </div>
      <div className="datetime-row">
        <span className="datetime-label">Time:</span>
        <span className="datetime-value">{formatTime(dateTime)}</span>
      </div>
    </div>
  );
}
