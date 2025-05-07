"use client";

import React, { JSX, useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import GaugeChart from "react-gauge-chart";
import apiList from "@/app/apiList";

interface Overview {
  yesPercentage: string;
  noPercentage: string;
  unsurePercentage: string;
  yes: number;
  no: number;
  unsure: number;
}

interface Block extends Overview {
  name: string;
}

interface Subblock extends Overview {
  name: string;
  block: string;
}

interface UserInformation {
  first_name: string;
  last_name: string;
  email: string;
  jobTitle: string;
}

interface CompanyInformation {
  companyName: string;
  companyLogo: string;
  website: string;
  industry: string;
  businessType: string;
  yearInBusiness: number;
  revenueRange: string;
}

interface AssessmentResult {
  businessOverview: Overview[];
  block: Block[];
  subblock1: Subblock[];
}

interface AssessmentObjItem {
  _id: string;
  ans: string;
}

interface AssessmentData {
  AssessmentResult: AssessmentResult;
  AssessmentResultDescriptions?: Record<string, string>;
  AssessmentObj: AssessmentObjItem[];
  UserInformation: UserInformation;
  CompanyInformation: CompanyInformation;
}

function customRound(value: number): number {
  const integer = Math.floor(value);
  const fraction = value - integer;
  return fraction > 0.5 ? integer + 1 : integer;
}

export default function PdfPreview(): JSX.Element {
  const params = useParams();
  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? idParam
      : Array.isArray(idParam) && idParam.length > 0
      ? idParam[0]
      : "";

  const [data, setData] = useState<AssessmentData | null>(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get<AssessmentData>(apiList.fetchSingleAssessment + id)
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [id]);

  if (!id) {
    return <div className="error-message">❗️ Missing report ID</div>;
  }
  if (!data) {
    return <div className="loading-message">Loading report…</div>;
  }

  const {
    AssessmentResult,
    AssessmentResultDescriptions,
    UserInformation: user,
    CompanyInformation: company,
  } = data;


  const exec = AssessmentResult.businessOverview[0];
  const yesPct = customRound(parseFloat(exec.yesPercentage));
  const noPct = customRound(parseFloat(exec.noPercentage));
  const unsurePct = customRound(parseFloat(exec.unsurePercentage));

  const overallData = [
    { name: "Yes", value: yesPct, count: exec.yes },
    { name: "No", value: noPct, count: exec.no },
    { name: "Unsure", value: unsurePct, count: exec.unsure },
  ];
  const COLORS = ["#33FF57", "#FF5733", "#FFC300"];

  return (
    <>
      <div className="report-container">
        {/* ========== HEADER ========== */}
        <header className="report-header">
          <div className="header-left">
            
            <Image
              src="/logo.png"
              alt={`${company.companyName} logo`}
              width={130}
              height={50}
              objectFit="contain"
            />
          </div>
          <div className="header-center">
            <h1 className="report-title">Standard Assessment Report</h1>
            <p className="report-subtitle">
              Prepared for {user.first_name} {user.last_name}
            </p>
          </div>
        </header>

        <div className="company-info">
          <div className="company-name">Company: {company.companyName}</div>
          <a
            href={company.website}
            className="company-website"
            target="_blank"
            rel="noopener noreferrer"
          >
            🌍 {company.website}
          </a>
        </div>

        <main>
          {/* EXECUTIVE SUMMARY */}
          <section className="section executive-summary">
            <h2>Business Overview</h2>
            <p>
              {AssessmentResultDescriptions?.["Business Overview"] ??
                "No summary available."}
            </p>
          </section>

          {/* ASSESSMENT METRICS */}
          <section className="section assessment-metrics">
            <h2>Your Business Health Score</h2>
            <ul className="metrics-legend">
              <li>
                <span className="legend-color poor" /> Poor
              </li>
              <li>
                <span className="legend-color bad" /> Bad
              </li>
              <li>
                <span className="legend-color average" /> Average
              </li>
              <li>
                <span className="legend-color good" /> Good
              </li>
              <li>
                <span className="legend-color excellent" /> Excellent
              </li>
            </ul>
          </section>

          {/* OVERALL HEALTH */}
          <section className="section overall-health">
            <div className="pie-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallData}
                    dataKey="value"
                    outerRadius={64}
                    innerRadius={40}
                    label={false}
                  >
                    {overallData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-label">{yesPct}%</div>
            </div>
            <ul className="overall-stats">
              {overallData.map((d, i) => (
                <li key={i}>
                  <span className="stat-color" style={{ background: COLORS[i] }} />
                  <strong>{d.name}:</strong> {d.value}% ({d.count})
                </li>
              ))}
            </ul>
          </section>

          <div className="page-break" />

          {/* BLOCKS & SUBBLOCKS */}
          {AssessmentResult.block.map((blk) => {
            const subblocks = AssessmentResult.subblock1.filter(
              (sb) => sb.block === blk.name
            );
            const blkPct = customRound(parseFloat(blk.yesPercentage));

            return (
              <section key={blk.name} className="section block-section">
                <h3>{blk.name}</h3>
                <div className="block-main">
                  <div className="gauge-chart-wrapper">
                    <GaugeChart
                      id={`gauge-${blk.name}`}
                      nrOfLevels={5}
                      colors={[
                        "#dc4e44",
                        "#f89827",
                        "#efda1f",
                        "#09bd4f",
                        "#156935",
                      ]}
                      arcWidth={0.3}
                      percent={blkPct / 100}
                      textColor="transparent"
                      style={{ width: "100%", height: "100%" }}
                    />
                    <div className="chart-label">{blkPct}%</div>
                  </div>
                  <p className="block-text">
                    Yes {blkPct}%, No{" "}
                    {customRound(parseFloat(blk.noPercentage))}%, Unsure{" "}
                    {customRound(parseFloat(blk.unsurePercentage))}%.
                  </p>
                </div>
                {AssessmentResultDescriptions?.[blk.name] && (
                  <p className="block-desc">
                    {AssessmentResultDescriptions[blk.name]}
                  </p>
                )}
                {subblocks.length > 0 && (
                  <div className="subblocks">
                    <h4>Sub Block Level</h4>
                    {subblocks.map((sb) => {
                      const sbPct = customRound(parseFloat(sb.yesPercentage));
                      return (
                        <div key={sb.name} className="subblock-item">
                          <div className="gauge-chart-wrapper">
                            <GaugeChart
                              id={`gauge-${blk.name}-${sb.name}`}
                              nrOfLevels={5}
                              colors={[
                                "#dc4e44",
                                "#f89827",
                                "#efda1f",
                                "#09bd4f",
                                "#156935",
                              ]}
                              arcWidth={0.3}
                              percent={sbPct / 100}
                              textColor="transparent"
                              style={{ width: "100%", height: "100%" }}
                            />
                            <div className="chart-label">{sbPct}%</div>
                          </div>
                          <div className="subblock-text">
                            <strong>{sb.name}</strong>
                            <p className="subblock-desc">
                              Yes {sbPct}%, No{" "}
                              {customRound(parseFloat(sb.noPercentage))}%, Unsure{" "}
                              {customRound(parseFloat(sb.unsurePercentage))}%.
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

        {/* FOOTER */}
        <footer className="report-footer">
        <p>© {new Date().getFullYear()} Panorama Management Advisory Services</p>
        <div>Confidential & Proprietary</div>

      </footer>

        <button
          onClick={() => window.print()}
          className="print-button"
        >
          Print / Save as PDF
        </button>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: serif;
          background: #f7fafc;
          color: #2d3748;
        }

        /* — Layout Container — */
        .report-container {
          width: 210mm;
          min-height: 297mm;
          margin: auto;
          padding: 20mm;
          background: white;
          display: flex;
          flex-direction: column;
        }

        /* — Header — */
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #4c51bf;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .header-left {
          display: flex;
          align-items: center;
        }
        .company-info {
          margin-left: 0.75rem;
        }
        .company-name {
          font-weight: bold;
        }
        .company-website {
          font-size: 0.85rem;
          color: #4c51bf;
          text-decoration: none;
        }
        .header-center {
          text-align: center;
        }
        .report-title {
          font-size: 1.6rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .report-subtitle {
          font-size: 0.9rem;
          color: #4c51bf;
          margin-top: 0.25rem;
        }

        /* — Sections — */
        .section {
          margin-bottom: 1.5rem;
          page-break-inside: avoid;
        }
        .section h2 {
          font-size: 1.25rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.25rem;
          margin-bottom: 0.75rem;
        }
        .executive-summary p {
          line-height: 1.6;
        }

        /* — Metrics Legend — */
        .metrics-legend {
          list-style: none;
          display: flex;
          justify-content: space-around;
          font-size: 0.9rem;
        }
        .metrics-legend li {
          display: flex;
          align-items: center;
        }
        .legend-color {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        .legend-color.poor {
          background: #e53e3e;
        }
        .legend-color.bad {
          background: #dd6b20;
        }
        .legend-color.average {
          background: #d69e2e;
        }
        .legend-color.good {
          background: #38a169;
        }
        .legend-color.excellent {
          background: #2f855a;
        }

        /* — Overall Health — */
        .overall-health {
          display: flex;
          align-items: center;
        }
        .pie-chart-wrapper,
        .gauge-chart-wrapper {
          width: 160px;
          height: 160px;
          position: relative;
          flex-shrink: 0;
          margin-right: 1rem;
        }
        .pie-chart-wrapper .recharts-responsive-container {
          width: 100% !important;
          height: 100% !important;
        }
        .gauge-chart-wrapper .chart-label {
          width: auto !important;
          height: auto !important;
        }
        p, li, td, th {
          text-align: justify;
        }
        .chart-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
          font-weight: bold;
          color: #2d3748;
          text-align: center;
          pointer-events: none;
        }
        .overall-stats {
          list-style: none;
          font-size: 0.9rem;
        }
        .overall-stats li {
          margin-bottom: 0.25rem;
        }
        .stat-color {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        /* — Blocks & Subblocks — */
        .block-section h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .block-main {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .block-text {
          margin-left: 1rem;
          line-height: 1.4;
        }
        .block-desc {
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }
        .subblocks {
          margin-left: 1.5rem;
        }
        .subblocks h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        .subblock-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        .subblock-text {
          margin-left: 0.75rem;
          font-size: 0.9rem;
        }
        .subblock-desc {
          margin-top: 0.25rem;
          line-height: 1.4;
        }

       

        /* — Footer — */
        .report-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.5rem;
          font-size: 0.75rem;
        }
        .page-break {
          page-break-after: always;
        }
        @page {
          size: A4 portrait;
          margin: 15mm;
          counter-increment: page;
        }
        @media print {
          body {
            background: white;
          }
          .print-button {
            display: none;
          }
        }

        /* — Print Button — */
        .print-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #4c51bf;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
