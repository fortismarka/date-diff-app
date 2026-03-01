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

        * { box-sizing: border-box; }

        .card {
          background: #12121a;
          border: 1px solid #2a2a3a;
          border-radius: 4px;
          width: 100%;
          max-width: 540px;
          padding: 48px 40px 36px;
        }

        .title {
          font-family: 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: #e8e0d0;
          letter-spacing: -0.3px;
          margin: 0 0 8px 0;
        }

        .description {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: #555;
          line-height: 1.7;
          margin: 0 0 36px 0;
        }

        .label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #555;
          display: block;
          margin-bottom: 8px;
        }

        .date-input {
          width: 100%;
          background: #0a0a0f;
          border: 1px solid #2a2a3a;
          border-radius: 2px;
          color: #e8e0d0;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          padding: 12px 14px;
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
          font-family: 'Inter', sans-serif;
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
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 0;
          border-bottom: 1px solid #1a1a24;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .result-row.show {
          opacity: 1;
          transform: translateY(0);
        }

        .result-row:nth-child(1) { transition-delay: 0.04s; }
        .result-row:nth-child(2) { transition-delay: 0.10s; }
        .result-row:nth-child(3) { transition-delay: 0.16s; }
        .result-row:nth-child(4) { transition-delay: 0.22s; }
        .result-row:nth-child(5) { transition-delay: 0.28s; }

        .result-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #555;
        }

        .result-number {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .result-value {
          font-family: 'Inter', sans-serif;
          font-size: 28px;
          font-weight: 600;
          color: #c8a96e;
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .result-value.urgent {
          color: #e07a5f;
        }

        .result-unit {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #444;
          letter-spacing: 0.5px;
        }

        .empty-state {
          margin-top: 36px;
          border-top: 1px solid #1e1e2a;
          padding-top: 28px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #333;
          letter-spacing: 1.5px;
          text-align: center;
        }

        .holiday-note {
          margin-top: 20px;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          color: #2a2a38;
          letter-spacing: 0.5px;
          line-height: 1.8;
          text-align: center;
        }

        .footer {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #1a1a24;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 400;
          color: #333;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .footer a {
          color: #c8a96e;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer a:hover {
          color: #e8c88e;
          text-decoration: underline;
        }
      `}</style>

      <div className="card">
        <div className="title">Date Difference</div>
        <div className="description">
          Calculates the count of calendar, business, and working days between two dates<br />
          Helps to know how many days of runway you have left remaining
        </div>

        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="date-input"
            value={date1}
            max={maxDateStr}
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
            max={maxDateStr}
            onChange={e => setDate2(e.target.value)}
          />
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
