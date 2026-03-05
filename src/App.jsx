import { useState, useEffect } from "react";

function getNthWeekday(year, month, weekday, n) {
  if (n > 0) {
    let d = new Date(year, month, 1);
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    d.setDate(d.getDate() + (n - 1) * 7);
    return d;
  } else {
    let d = new Date(year, month + 1, 0);
    while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
    return d;
  }
}

function getFederalHolidays(year) {
  const holidays = [
    new Date(year, 0, 1),
    getNthWeekday(year, 0, 1, 3),
    getNthWeekday(year, 1, 1, 3),
    getNthWeekday(year, 4, 1, -1),
    new Date(year, 5, 19),
    new Date(year, 6, 4),
    getNthWeekday(year, 8, 1, 1),
    getNthWeekday(year, 9, 1, 2),
    new Date(year, 10, 11),
    getNthWeekday(year, 10, 4, 4),
    new Date(year, 11, 25),
  ];
  return holidays.map(h => {
    const d = new Date(h);
    if (d.getDay() === 6) d.setDate(d.getDate() - 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toDateString();
  });
}

function roundToQuarter(value) {
  return Math.round(value * 4) / 4;
}

function calcDiffs(date1, date2) {
  if (!date1 || !date2) return null;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const start = d1 < d2 ? d1 : d2;
  const end = d1 < d2 ? d2 : d1;

  const msPerDay = 86400000;
  const calendarDays = Math.round((end - start) / msPerDay);
  const rawMonths = calendarDays / 30.4375;
  const months = roundToQuarter(rawMonths);
  const weeks = Math.floor(calendarDays / 7);

  let businessDays = 0;
  let businessDaysMinusHolidays = 0;

  const holidaySet = new Set();
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    getFederalHolidays(y).forEach(h => holidaySet.add(h));
  }

  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) {
      businessDays++;
      if (!holidaySet.has(cur.toDateString())) {
        businessDaysMinusHolidays++;
      }
    }
    cur.setDate(cur.getDate() + 1);
  }

  return { calendarDays, businessDays, businessDaysMinusHolidays, months, weeks };
}

const today = new Date();
const maxDate = new Date(today);
maxDate.setFullYear(today.getFullYear() + 10);
const maxDateStr = maxDate.toISOString().split("T")[0];

export default function DateDiffApp() {
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [result, setResult] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (date1 && date2) {
      const r = calcDiffs(date1, date2);
      setResult(r);
      setAnimate(false);
      requestAnimationFrame(() => setAnimate(true));
    } else {
      setResult(null);
    }
  }, [date1, date2]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Inter', sans-serif; }

        .card {
          background: #13131a;
          border: 1px solid #2a2a3a;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
        }

        .app-title {
          font-family: 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.3px;
          margin-bottom: 4px;
        }

        .app-tagline {
          font-size: 13px;
          color: #6b6b80;
          margin-bottom: 32px;
          font-weight: 400;
        }

        .date-inputs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 11px;
          font-weight: 500;
          color: #6b6b80;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .date-input {
          background: #1e1e2e;
          border: 1px solid #2a2a3a;
          border-radius: 8px;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          padding: 12px 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }

        .date-input:focus {
          border-color: #4a4a6a;
        }

        .date-input::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }

        .results {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #1e1e2e;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .result-row.show {
          opacity: 1;
          transform: translateY(0);
        }

        .result-row:nth-child(1) { transition-delay: 0.05s; }
        .result-row:nth-child(2) { transition-delay: 0.1s; }
        .result-row:nth-child(3) { transition-delay: 0.15s; }
        .result-row:nth-child(4) { transition-delay: 0.2s; }
        .result-row:nth-child(5) { transition-delay: 0.25s; }

        .result-row:last-of-type {
          border-bottom: none;
        }

        .result-label {
          font-size: 13px;
          color: #6b6b80;
          font-weight: 400;
        }

        .result-number {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .result-value {
          font-size: 22px;
          font-weight: 600;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.5px;
        }

        .result-value.urgent {
          color: #f59e0b;
        }

        .result-unit {
          font-size: 12px;
          color: #4a4a6a;
          font-weight: 400;
        }

        .holiday-note {
          font-size: 11px;
          color: #3a3a5a;
          margin-top: 12px;
          line-height: 1.5;
        }

        .empty-state {
          text-align: center;
          color: #3a3a5a;
          font-size: 13px;
          padding: 20px 0;
        }

        .footer {
          margin-top: 28px;
          font-size: 11px;
          color: #3a3a5a;
          text-align: center;
        }

        .footer a {
          color: #c9a84c;
          text-decoration: none;
        }

        .footer a:hover {
          color: #e0c070;
        }
      `}</style>

      <div className="card">
        <div className="app-title">Date Difference Calculator</div>
        <div className="app-tagline">Helps to know how many days of runway you have</div>

        <div className="date-inputs">
          <div className="input-group">
            <label className="input-label">Start Date</label>
            <input
              type="date"
              className="date-input"
              value={date1}
              max={maxDateStr}
              onChange={e => setDate1(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">End Date</label>
            <input
              type="date"
              className="date-input"
              value={date2}
              max={maxDateStr}
              onChange={e => setDate2(e.target.value)}
            />
          </div>
        </div>

        {result ? (
          <div className="results">
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Calendar Days</span>
              <div className="result-number">
                <span className="result-value">{result.calendarDays.toLocaleString()}</span>
                <span className="result-unit">days</span>
              </div>
            </div>
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Without Weekends</span>
              <div className="result-number">
                <span className="result-value">{result.businessDays.toLocaleString()}</span>
                <span className="result-unit">days</span>
              </div>
            </div>
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Minus Holidays</span>
              <div className="result-number">
                <span className="result-value">{result.businessDaysMinusHolidays.toLocaleString()}</span>
                <span className="result-unit">days</span>
              </div>
            </div>
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Weeks</span>
              <div className="result-number">
                <span className={`result-value ${result.weeks < 4 ? 'urgent' : ''}`}>
                  {result.weeks < 4 ? `<${result.weeks + 1}` : result.weeks.toLocaleString()}
                </span>
                <span className="result-unit">wks</span>
              </div>
            </div>
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Months</span>
              <div className="result-number">
                <span className={`result-value ${result.weeks < 4 ? 'urgent' : ''}`}>
                  {result.weeks < 4 ? '<1' : result.months.toFixed(2)}
                </span>
                <span className="result-unit">mo</span>
              </div>
            </div>
            <div className="holiday-note">
              minus holidays excludes us federal holidays · months rounded to nearest ¼
            </div>
          </div>
        ) : (
          <div className="empty-state">
            select both dates to calculate
          </div>
        )}

        <div className="footer">
          App Built and Deployed by{" "}
          <a href="https://fortismarka.com" target="_blank" rel="noopener noreferrer">
            Fortis Marka
          </a>
        </div>
      </div>
    </div>
  );
}
