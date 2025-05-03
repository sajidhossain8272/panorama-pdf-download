// app/individualCompany/[id]/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from 'recharts';

//
// --- Advanced Color Palettes and Dash Patterns ---
const defaultColors = [
  "#3b82f6", "#e53935", "#f59e0b", "#9333ea", "#ef4444",
  "#f97316", "#22c55e", "#eab308", "#8b5cf6", "#009688",
];
const alternateColors = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#C9CBCF", "#8B0000", "#006400", "#000080",
];
const lineDashPatterns = [
  "0", "3 3", "1 1", "5 2", "3 4 1 4", "3 3 1 3", "7 3 1 3", "2 2",
];

type RawBlock = {
  block: string;
  [userKey: string]: number | string;
};

type RawSubblock = {
  block: string;
  subblock: string;
  [userKey: string]: number | string;
};

interface ApiResponse {
  ReportData: {
    Blocks: RawBlock[];
    Subblock1: RawSubblock[];
  };
  AssessmentResultDescriptions: Record<string, string>;
}

export default function IndividualCompanyReportPage() {
  // get the company ID from the URL
  const { id: rawId } = useParams();
  const companyId = Array.isArray(rawId) ? rawId[0] : rawId ?? '';

  const [reportData, setReportData] = useState<ApiResponse['ReportData'] | null>(null);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    axios.get<ApiResponse>(`https://api.panoramamas.com/api/standard-reports/${companyId}`)
      .then(res => {
        setReportData(res.data.ReportData);
        setDescriptions(res.data.AssessmentResultDescriptions || {});
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, [companyId]);

  const blocks = reportData?.Blocks ?? [];
  const subblocks1 = reportData?.Subblock1 ?? [];

  // detect the personal column
  const personalKey = useMemo(() => {
    if (!blocks.length) return '';
    return Object.keys(blocks[0]).find(k => k !== 'block' && k !== 'Company Average') || '';
  }, [blocks]);

  // group sub-blocks
  const subGrouped = useMemo(() => {
    const map: Record<string, RawSubblock[]> = {};
    subblocks1.forEach(item => {
      map[item.block] = map[item.block] || [];
      map[item.block].push(item);
    });
    return map;
  }, [subblocks1]);

  // early exits
  if (!companyId) return <div style={{ padding: 16 }}>❗ Missing report ID</div>;
  if (error)      return <div style={{ padding: 16, color: 'red' }}>Error loading report: {error}</div>;
  if (!reportData) return <div style={{ padding: 16 }}>Loading report…</div>;

  const chartMargin = { top: 20, right: 40, left: 40, bottom: 180 };
  const today = new Date().toLocaleDateString();
  const fmt  = (v: unknown) => Math.round(Number(v));
  const diff = (a: number, b: number) => a - b;

  return (
    <>
    <div > 
      {/* ===== Header ===== */}
      <header className="report-header">
    <img
              src="/logo.png"
              width={130}
              height={50}
            />        <div className="report-info">
          <h1>Company Average Report</h1>
          <p>ID: <strong>{companyId}</strong></p>
          <p>Date: {today}</p>
        </div>
      </header>

      {/* Print button */}
      <button className="print-button" onClick={() => window.print()}>
        Print / Save as PDF
      </button>

      <div className="report-container">

        {/* ===== Business Overview Chart ===== */}
        <section className="chart-page">
          <h2>Business Overview</h2>
          {descriptions["Business Overview"] && (
            <p className="section-desc">{descriptions["Business Overview"]}</p>
          )}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={650}>
              <LineChart data={blocks} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="block"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={160}
                  tickMargin={40}
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 120]} tickFormatter={v => `${v}%`} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey={personalKey}
                  name={personalKey}
                  stroke={defaultColors[0]}
                  strokeDasharray={lineDashPatterns[0]}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="Company Average"
                  name="Company Average"
                  stroke={defaultColors[1]}
                  strokeDasharray={lineDashPatterns[1]}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===== Business Overview Stats ===== */}
        <section className="stats-page">
          <h3>Block Statistics: {personalKey} vs Company Average</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Company Avg</th>
                <th>{personalKey}</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map(b => {
                const ca = fmt(b["Company Average"]);
                const me = fmt(b[personalKey]);
                const d  = diff(me, ca);
                return (
                  <tr key={b.block}>
                    <td>{b.block}</td>
                    <td>{ca}</td>
                    <td>{me}</td>
                    <td className={d >= 0 ? 'pos' : 'neg'}>
                      {d >= 0 ? `+${d}` : d}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ===== Each Block’s Sub-Block ===== */}
        {blocks.map(blk => {
          const subs = subGrouped[blk.block] || [];
          return (
            <React.Fragment key={blk.block}>
              {/* Sub-Block Chart */}
              <section className="chart-page">
                <h2>{blk.block}</h2>
                {descriptions[blk.block] && (
                  <p className="section-desc">{descriptions[blk.block]}</p>
                )}
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={650}>
                    <LineChart data={subs} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="subblock"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={160}
                        tickMargin={40}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis domain={[0, 120]} tickFormatter={v => `${v}%`} />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey={personalKey}
                        name={personalKey}
                        stroke={alternateColors[0]}
                        strokeDasharray={lineDashPatterns[2]}
                        dot
                      />
                      <Line
                        type="monotone"
                        dataKey="Company Average"
                        name="Company Average"
                        stroke={alternateColors[1]}
                        strokeDasharray={lineDashPatterns[3]}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Sub-Block Stats */}
              <section className="stats-page">
                <h3>Sub-Block Statistics: {blk.block}</h3>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Sub-Block</th>
                      <th>Company Avg</th>
                      <th>{personalKey}</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map(s => {
                      const ca = fmt(s["Company Average"]);
                      const me = fmt(s[personalKey]);
                      const d  = diff(me, ca);
                      return (
                        <tr key={s.subblock}>
                          <td>{s.subblock}</td>
                          <td>{ca}</td>
                          <td>{me}</td>
                          <td className={d >= 0 ? 'pos' : 'neg'}>
                            {d >= 0 ? `+${d}` : d}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            </React.Fragment>
          );
        })}

      </div>

      {/* ===== Footer ===== */}
      <footer className="report-footer">
        <p>© {new Date().getFullYear()} Panorama Management Advisory Services</p>
        <div>Confidential & Proprietary</div>

      </footer>
      </div>
      {/* ===== Component-Scoped Styles ===== */}
      <style jsx>{`
        /* Header & Footer */
        .report-header,
        .report-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f5f5;
          padding: 12px 24px;
          font-family: sans-serif;
          font-size: 14px;
        }
        .report-header { border-bottom: 1px solid #ddd; }
        .report-footer { border-top: 1px solid #ddd; }
        .logo { font-size: 18px; font-weight: bold; }
        .report-info h1 { margin: 0 0 4px; font-size: 20px; }
        .report-info p { margin: 2px 0; }

        /* Print button */
        .print-button {
          position: fixed;
          top: 16px; right: 16px;
          z-index: 1000;
          padding: 8px 12px;
          background: #4c51bf;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: sans-serif;
        }
        @media print { .print-button { display: none; } }

        /* Container */
        .report-container {
          max-width: 860px;
          margin: 0 auto;
          padding-top: 16px;
     
        }

        /* Chart pages */
        .chart-page {
          text-align: center;
          padding-bottom: 40px;
        }

        /* Stats pages */
        .stats-page {
          text-align: center;
          padding-bottom: 40px;
        }

        h2, h3 {
          font-family: sans-serif;
          margin-bottom: 8px;
        }
        .section-desc {
          margin: 0 auto 16px;
          max-width: 700px;
          color: #555;
          font-family: sans-serif;
          line-height: 1.4;
        }

        .chart-wrapper {
          width: 100%;
          max-width: 840px;
          margin: 0 auto 32px;
        }

        .stats-table {
          width: 100%;
          max-width: 840px;
          margin: 0 auto;
          border-collapse: collapse;
          font-family: sans-serif;
        }
        .stats-table th,
        .stats-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        .stats-table th {
          background: #f0f0f0;
        }
        .pos { color: green; }
        .neg { color: red; }
      `}</style>

      {/* ===== Global Print Styles ===== */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 20mm;
          counter-increment: page;
          
        }
        html, body {
          width: 210mm;
          height: 297mm;
        
        }
        @media print {
          body {
            margin: 0;
            background: white !important;
          }
          .report-header {
            position: fixed; top: 0; left: 0; right: 0;
          }
          .report-footer {
            position: fixed; bottom: 0; left: 0; right: 0;
          }
          .pageNumber::before {
            content: counter(page);
          }
        }
      `}</style>
    </>
  );
}
