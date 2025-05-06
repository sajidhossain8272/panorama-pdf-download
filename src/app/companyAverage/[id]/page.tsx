// File: app/pdf/PdfCompanyReport.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import GaugeChart from "react-gauge-chart";
import "@/app/globals.css";
import apiList from "@/app/apiList";

// — Type definitions —
interface ReportOverviewItem {
  block: string;
  subblock1: string;
  name: string;
  yes: number;
  no: number;
  unsure: number;
  yesPercentage: number;
  noPercentage: number;
  unsurePercentage: number;
}

export interface CompanyReportItem {
  _id: string;
  report_name: string;
  report_description: string;
  report_cost: number;
  report_type: string;
  report_status: string;
  report_Assessments: string[];
  report_participants: string[];
  CompanyInformation: {
    companyName: string;
    companyLogo?: string;
    website: string;
  };
  CreatedAt?: string | number | Date;
  ReportData: {
    businessOverview?: ReportOverviewItem[];
    block?: ReportOverviewItem[];
    subblock1?: ReportOverviewItem[];
  };
  AssessmentResultDescriptions?: Record<string, string>;
}

// — Rounds a value to an integer with no decimals: if fraction > 0.5 → ceil, else → floor
function customRound(value: number): number {
  const integer = Math.floor(value);
  const fraction = value - integer;
  return fraction > 0.5 ? integer + 1 : integer;
}

// — Computes gauge percent (0–1) using the same rule internally
function getGaugePercent(yes: number, no: number, unsure: number): number {
  const total = yes + no + unsure;
  if (total === 0) return 0;
  const raw = (yes / total) * 100;
  const floored = Math.floor(raw);
  const rounded = (raw - floored > 0.5 ? floored + 1 : floored);
  return rounded / 100;
}

// — Picks a color band
function getColorByPercentage(pct: number): string {
  if (pct <= 20) return "#dc4e44";
  if (pct <= 40) return "#f89827";
  if (pct <= 60) return "#efda1f";
  if (pct <= 80) return "#09bd4f";
  return "#156935";
}

export default function PdfCompanyReport() {
  const params = useParams();
  const rawId = params.id;
  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId) && rawId.length > 0
      ? rawId[0]
      : "";

  const [report, setReport] = useState<CompanyReportItem | null>(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get<CompanyReportItem>(`${apiList.getReports}/${id}`)
      .then((res) => setReport(res.data))
      .catch(console.error);
  }, [id]);

  // defaults if missing
  const ReportData        = report?.ReportData        || {};
  const businessOverview = ReportData.businessOverview || [];
  const blocks           = ReportData.block           || [];
  const sub1             = ReportData.subblock1       || [];

  const subGrouped = useMemo(() => {
    const m: Record<string, ReportOverviewItem[]> = {};
    sub1.forEach((item) => {
      (m[item.block] = m[item.block] || []).push(item);
    });
    return m;
  }, [sub1]);

  if (!id) {
    return <div className="error-message">❗️ Missing report ID</div>;
  }
  if (!report) {
    return <div className="loading-message">Loading report…</div>;
  }

  const {
    report_name,
    report_description,
    report_type,
    CompanyInformation: company,
    AssessmentResultDescriptions,
    CreatedAt,
  } = report;

  const reportDate = CreatedAt
    ? new Date(CreatedAt).toLocaleDateString()
    : "";

  return (
    <>
      <div className="report-container">
        {/* ========== HEADER ========== */}
        <header className="report-header">
          <div className="header-left">
            <img
            src="/logo.png"
            width={130}
            height={50}
          />   
          </div>
          <div className="header-center">
            
            <h1 className="report-title">{report_name}</h1>
            {reportDate && (
              <p className="report-subtitle">Date: {reportDate}</p>
            )}
            
            <p className="report-description flex justify-center">{report_description}</p>
          </div>
          <div className="header-right">
            <p>Type: {report_type}</p>
          </div>
        </header>

        {/* ========== COMPANY INFO ========== */}
        <div className="company-info" style={{ marginBottom: "1rem" }}>
          <div className="company-name">{company.companyName}</div>
        </div>

        <main className="report-content">
          {/* BUSINESS OVERVIEW */}
          {businessOverview.length > 0 && (
            <section className="section executive-summary">
              <h2>Business Overview</h2>
              {AssessmentResultDescriptions?.["Business Overview"] && (
                <p className="block-desc">
                  {AssessmentResultDescriptions["Business Overview"]}
                </p>
              )}
              {businessOverview.map((item, idx) => {
                const pct = customRound(item.yesPercentage);
                return (
                  <div key={idx} className="block-main" style={{ marginBottom: "1.5rem" }}>
                    <div className="gauge-chart-wrapper">
                      <GaugeChart
                        id={`overview-gauge-${idx}`}
                        nrOfLevels={5}
                        colors={[
                          "#dc4e44",
                          "#f89827",
                          "#efda1f",
                          "#09bd4f",
                          "#156935",
                        ]}
                        arcWidth={0.3}
                        percent={getGaugePercent(item.yes, item.no, item.unsure)}
                        textColor="transparent"
                        style={{ width: "100%", height: "100%" }}
                      />
                      <div className="chart-label">{pct}%</div>
                    </div>
                    <p className="ml-4 text-base leading-[1.4] text-gray-700 text-justify flex flex-1 gap-4 items-center justify-center">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{ background: getColorByPercentage(item.yesPercentage) }}
                      />
                      Yes {customRound(item.yesPercentage)}%,
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1 ml-4"
                        style={{ background: getColorByPercentage(item.noPercentage) }}
                      />
                      No {customRound(item.noPercentage)}%,
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1 ml-4"
                        style={{ background: getColorByPercentage(item.unsurePercentage) }}
                      />
                      Unsure {customRound(item.unsurePercentage)}%.
                    </p>
                  </div>
                );
              })}
            </section>
          )}

          {/* METRICS LEGEND */}
          <section className="section assessment-metrics">
            <h2>Assessment Metrics</h2>
            <ul className="metrics-legend">
              <li><span className="legend-color poor"    />Poor</li>
              <li><span className="legend-color bad"     />Bad</li>
              <li><span className="legend-color average" />Average</li>
              <li><span className="legend-color good"    />Good</li>
              <li><span className="legend-color excellent"/>Excellent</li>
            </ul>
          </section>

          {/* BLOCKS & SUBBLOCKS */}
          {blocks.map((blk) => {
            const pct = customRound(blk.yesPercentage);
            const gauge = getGaugePercent(blk.yes, blk.no, blk.unsure);
            const subItems = subGrouped[blk.name] || [];

            return (
              <section key={blk.name} className="section block-section">
                <h3>{blk.name}</h3>
                <div className="block-main">
                  <div className="gauge-chart-wrapper">
                    <GaugeChart
                      id={`block-gauge-${blk.name}`}
                      nrOfLevels={5}
                      colors={[
                        "#dc4e44",
                        "#f89827",
                        "#efda1f",
                        "#09bd4f",
                        "#156935",
                      ]}
                      arcWidth={0.3}
                      percent={gauge}
                      textColor="transparent"
                      style={{ width: "100%", height: "100%" }}
                    />
                    <div className="chart-label">{pct}%</div>
                  </div>
                  <p className="ml-4 text-base leading-[1.4] text-gray-700 text-justify flex flex-1 gap-4 items-center justify-center">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ background: getColorByPercentage(blk.yesPercentage) }}
                    />
                    Yes {customRound(blk.yesPercentage)}%,
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1 ml-4"
                      style={{ background: getColorByPercentage(blk.noPercentage) }}
                    />
                    No {customRound(blk.noPercentage)}%,
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1 ml-4"
                      style={{ background: getColorByPercentage(blk.unsurePercentage) }}
                    />
                    Unsure {customRound(blk.unsurePercentage)}%.
                  </p>
                </div>
                {AssessmentResultDescriptions?.[blk.name] && (
                  <p className="block-desc">{AssessmentResultDescriptions[blk.name]}</p>
                )}
                {subItems.length > 0 && (
                  <div className="subblocks">
                    <h4>Subblocks</h4>
                    {subItems.map((sb) => {
                      const sbPct = customRound(sb.yesPercentage);
                      const sbGauge = getGaugePercent(sb.yes, sb.no, sb.unsure);
                      return (
                        <div key={sb.name} className="subblock-item">
                          <div className="gauge-chart-wrapper">
                            <GaugeChart
                              id={`sub-gauge-${blk.name}-${sb.name}`}
                              nrOfLevels={5}
                              colors={[
                                "#dc4e44",
                                "#f89827",
                                "#efda1f",
                                "#09bd4f",
                                "#156935",
                              ]}
                              arcWidth={0.3}
                              percent={sbGauge}
                              textColor="transparent"
                              style={{ width: "100%", height: "100%" }}
                            />
                            <div className="chart-label">{sbPct}%</div>
                          </div>
                          <div className="subblock-text">
                            <strong>{sb.name}</strong>
                            <p className="ml-3 text-sm leading-snug text-gray-700 text-justify flex flex-1 gap-4 items-center justify-center">
                              <span
                                className="inline-block w-2 h-2 rounded-full mr-1"
                                style={{ background: getColorByPercentage(sb.yesPercentage) }}
                              />
                              Yes {sbPct}%,
                              <span
                                className="inline-block w-2 h-2 rounded-full mr-1 ml-4"
                                style={{ background: getColorByPercentage(sb.noPercentage) }}
                              />
                              No {customRound(sb.noPercentage)}%,
                              <span
                                className="inline-block w-2 h-2 rounded-full mr-1 ml-4"
                                style={{ background: getColorByPercentage(sb.unsurePercentage) }}
                              />
                              Unsure {customRound(sb.unsurePercentage)}%.
                            </p>
                            {AssessmentResultDescriptions?.[sb.name] && (
                              <p className="subblock-desc">
                                {AssessmentResultDescriptions[sb.name]}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </main>

        {/* ========== FOOTER ========== */}
        <footer className="report-footer">
        <p>© {new Date().getFullYear()} Panorama Management Advisory Services</p>
        <div>Confidential & Proprietary</div>

      </footer>

        <button onClick={() => window.print()} className="print-button">
          Print / Save as PDF
        </button>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: serif; background: #f7fafc; color: #2d3748; }

        /* — Layout Container — */
        .report-container {
          width: 210mm; min-height: 297mm;
          margin: auto; padding: 20mm;
          background: white; display: flex; flex-direction: column;
        }

        /* — Header — */
        .report-header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 3px solid #4c51bf; padding-bottom: 0.5rem; margin-bottom: 1rem;
        }
        .header-left { display: flex; align-items: center; }
        .header-center { text-align: center; flex: 1; padding: 0 1rem; }
        .header-right { text-align: right; }
        .report-title { font-size: 1.6rem; text-transform: uppercase; letter-spacing: 1px; }
        .report-subtitle { font-size: 0.9rem; color: #4c51bf; margin-top: 0.25rem; }
        .report-description { font-size: 0.85rem; color: #4a5568; margin-top: 0.5rem; }
        .header-right p { font-size: 0.85rem; line-height: 1.2; margin: 0.1rem 0; }

        /* — Company Info — */
        .company-info { margin-bottom: 1rem; }
        .company-name { font-weight: bold; }
        .company-website { font-size: 0.85rem; color: #4c51bf; text-decoration: none; }

        /* — Sections — */
        .section { margin-bottom: 1.5rem; page-break-inside: avoid; }
        .section h2 { font-size: 1.25rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.25rem; margin-bottom: 0.75rem; }
        .executive-summary p { line-height: 1.6; }

        /* — Metrics Legend — */
        .metrics-legend { list-style: none; display: flex; justify-content: space-around; font-size: 0.9rem; }
        .metrics-legend li { display: flex; align-items: center; }
        .legend-color { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 0.5rem; }
        .legend-color.poor     { background: #e53e3e; }
        .legend-color.bad      { background: #dd6b20; }
        .legend-color.average  { background: #d69e2e; }
        .legend-color.good     { background: #38a169; }
        .legend-color.excellent{ background: #2f855a; }

        /* — PRINT the background colours —*/
.legend-color,
.color-dot {                /* helper class we’ll add below           */
  -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
}

        /* — Charts & Stats — */
        .overall-health { display: flex; align-items: center; }
        .pie-chart-wrapper, .gauge-chart-wrapper { width: 160px; height: 160px; position: relative; flex-shrink: 0; margin-right: 1rem; }
        .pie-chart-wrapper .recharts-responsive-container { width: 100% !important; height: 100% !important; }
        .gauge-chart-wrapper .chart-label { width: auto !important; height: auto !important; }
        p, li, td, th { text-align: justify; }
        .chart-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.5rem; font-weight: bold; color: #2d3748; text-align: center; pointer-events: none; }
        .overall-stats { list-style: none; font-size: 0.9rem; }
        .overall-stats li { margin-bottom: 0.25rem; }
        .stat-color { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 0.5rem; }

        /* — Blocks & Subblocks — */
        .block-section h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
        .block-main { display: flex; align-items: center; margin-bottom: 0.75rem; }
        .block-desc { font-size: 0.9rem; line-height: 1.4; margin-bottom: 0.75rem; }
        .subblocks { margin-left: 1.5rem; }
        .subblocks h4 { font-size: 1rem; margin-bottom: 0.5rem; }
        .subblock-item { display: flex; align-items: flex-start; margin-bottom: 0.75rem; }
        .subblock-text { margin-left: 0.75rem; font-size: 0.9rem; }
        .subblock-desc { margin-top: 0.25rem; line-height: 1.4; }

        /* — Footer — */
        .report-footer { margin-top: auto; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 0.5rem; font-size: 0.75rem; }
        .page-number .pageNumber:after { content: counter(page); }

        /* — Page Break & Print — */
        .page-break { page-break-after: always; }
        @page { size: A4 portrait; margin: 15mm; counter-increment: page; }
        @media print { body { background: white; } .print-button { display: none; } }

        /* — Print Button — */
        .print-button {
          position: fixed; bottom: 20px; right: 20px;
          background: #4c51bf; color: white; border: none;
          padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
        }
      `}</style>
    </>
  );
}
