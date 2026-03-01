import { useState, useEffect } from "react";

const US_FEDERAL_HOLIDAYS = (year) => [
  new Date(year, 0, 1),   // New Year's Day
  new Date(year, 0, 20),  // MLK Day (3rd Mon Jan - approximate, recalculated below)
  new Date(year, 1, 17),  // Presidents Day (3rd Mon Feb - approximate)
  new Date(year, 4, 26),  // Memorial Day (last Mon May - approximate)
  new Date(year, 5, 19),  // Juneteenth
  new Date(year, 6, 4),   // Independence Day
  new Date(year, 8, 1),   // Labor Day (1st Mon Sep - approximate)
  new Date(year, 9, 13),  // Columbus Day (2nd Mon Oct - approximate)
  new Date(year, 10, 11), // Veterans Day
  new Date(year, 10, 27), // Thanksgiving (4th Thu Nov - approximate)
  new Date(year, 11, 25), // Christmas
];

function getNthWeekday(year, month, weekday, n) {
  // n=1 means first, n=-1 means last
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
    new Date(year, 0, 1),                         // New Year's Day
    getNthWeekday(year, 0, 1, 3),                  // MLK Day
    getNthWeekday(year, 1, 1, 3),                  // Presidents Day
    getNthWeekday(year, 4, 1, -1),                 // Memorial Day
    new Date(year, 5, 19),                         // Juneteenth
    new Date(year, 6, 4),                          // Independence Day
    getNthWeekday(year, 8, 1, 1),                  // Labor Day
    getNthWeekday(year, 9, 1, 2),                  // Columbus Day
    new Date(year, 10, 11),                        // Veterans Day
    getNthWeekday(year, 10, 4, 4),                 // Thanksgiving
    new Date(year, 11, 25),                        // Christmas
  ];
  // Observed rules: if holiday falls on Saturday, observe Friday; Sunday -> Monday
  return holidays.map(h => {
    const d = new Date(h);
    if (d.getDay() === 6) d.setDate(d.getDate() - 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.toDateString();
  });
}

function calcDiffs(date1, date2) {
  if (!date1 || !date2) return null;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const start = d1 < d2 ? d1 : d2;
  const end = d1 < d2 ? d2 : d1;

  const msPerDay = 86400000;
  const calendarDays = Math.round((end - start) / msPerDay);

  let businessDays = 0;
  let businessDaysMinusHolidays = 0;

  // Collect all holiday strings for years in range
  const holidaySet = new Set();
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    getFederalHolidays(y).forEach(h => holidaySet.add(h));
  }

  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1); // start counting from day after start
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

  return { calendarDays, businessDays, businessDaysMinusHolidays };
}

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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Mono:wght@300;400&display=swap');
        
        .card {
          background: #12121a;
          border: 1px solid #2a2a3a;
          border-radius: 4px;
          width: 100%;
          max-width: 520px;
          padding: 48px 40px;
        }

        .title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          font-weight: 700;
          color: #e8e0d0;
          letter-spacing: -0.5px;
          margin: 0 0 6px 0;
        }

        .subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 300;
          color: #555;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 40px 0;
        }

        .label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #666;
          display: block;
          margin-bottom: 8px;
        }

        .date-input {
          width: 100%;
          background: #0a0a0f;
          border: 1px solid #2a2a3a;
          border-radius: 2px;
          color: #e8e0d0;
          font-family: 'DM Mono', monospace;
          font-size: 16px;
          padding: 12px 14px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
          color-scheme: dark;
        }

        .date-input:focus {
          border-color: #c8a96e;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 20px 0;
          color: #333;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #1e1e2a;
        }

        .results {
          margin-top: 36px;
          border-top: 1px solid #1e1e2a;
          padding-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 14px 0;
          border-bottom: 1px solid #1a1a24;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .result-row.show {
          opacity: 1;
          transform: translateY(0);
        }

        .result-row:nth-child(1) { transition-delay: 0.05s; }
        .result-row:nth-child(2) { transition-delay: 0.15s; }
        .result-row:nth-child(3) { transition-delay: 0.25s; }

        .result-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #555;
        }

        .result-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          font-weight: 700;
          color: #c8a96e;
          letter-spacing: -1px;
        }

        .result-unit {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #444;
          letter-spacing: 1px;
          margin-left: 6px;
        }

        .empty-state {
          margin-top: 36px;
          border-top: 1px solid #1e1e2a;
          padding-top: 28px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #333;
          letter-spacing: 1.5px;
          text-align: center;
        }

        .holiday-note {
          margin-top: 28px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #333;
          letter-spacing: 1px;
          line-height: 1.8;
          text-align: center;
        }
      `}</style>

      <div className="card">
        <div className="title">Date Difference</div>
        <div className="subtitle">Calendar · Business · Working Days</div>

        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="date-input"
            value={date1}
            max={today}
            onChange={e => setDate1(e.target.value)}
          />
        </div>

        <div className="divider">to</div>

        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            className="date-input"
            value={date2}
            onChange={e => setDate2(e.target.value)}
          />
        </div>

        {result ? (
          <div className="results">
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Calendar Days</span>
              <span>
                <span className="result-value">{result.calendarDays.toLocaleString()}</span>
                <span className="result-unit">days</span>
              </span>
            </div>
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Business Days</span>
              <span>
                <span className="result-value">{result.businessDays.toLocaleString()}</span>
                <span className="result-unit">days</span>
              </span>
            </div>
            <div className={`result-row ${animate ? 'show' : ''}`}>
              <span className="result-label">Working Days</span>
              <span>
                <span className="result-value">{result.businessDaysMinusHolidays.toLocaleString()}</span>
                <span className="result-unit">days</span>
              </span>
            </div>
            <div className="holiday-note">
              working days excludes us federal holidays
            </div>
          </div>
        ) : (
          <div className="empty-state">
            select both dates to calculate
          </div>
        )}
      </div>
    </div>
  );
}
