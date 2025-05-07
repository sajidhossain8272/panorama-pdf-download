
// app/userBased/[id]/page.tsx
"use client";

import type { TooltipProps } from "recharts";

import React, {
  useEffect,
  useState,
  useMemo,
  Fragment,
} from "react";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import {
  ScatterChart,
  Scatter,
  CartesianGrid as ScatterGrid,
  XAxis as ScatterXAxis,
  YAxis as ScatterYAxis,
  ZAxis,
  Tooltip as ScatterTooltip,
  ResponsiveContainer as ScatterContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTheme } from "next-themes";

// ---------------------------------------------------------------- types
interface HeatmapEntry {
  userName: string;
  date?: string;
  blocks?: Array<{ blockName: string; yesPercentage: number }>;
}
interface BlockDataEntry {
  [key: string]: string | number;
  block: string;
}
interface SubBlockDataEntry {
  [key: string]: string | number;
  block: string;
  subblock: string;
}
interface RawApiResponse {
  ReportData: HeatmapEntry[];
  ReportData2: {
    Blocks: BlockDataEntry[];
    Subblock1: SubBlockDataEntry[];
    [key: string]: unknown;
  };
  report_name?: string;
}

// ---------------------------------------------------------------- Heatmap helpers
function getColor(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return "#cccccc";
  return `hsl(${(Math.max(0, Math.min(100, value)) * 120) / 100},100%,50%)`;
}
function roundValue(v: number): number {
  if (v === undefined || v === null || isNaN(v)) return 0;
  const i = Math.floor(v);
  return v - i > 0.5 ? i + 1 : i;
}
const CELL_WIDTH = 80;
const CELL_HEIGHT = 40;

interface CustomCellProps {
  cx: number;
  cy: number;
  payload: { value?: number };
}

const CustomCell = ({ cx, cy, payload }: CustomCellProps) => {
  if (!payload || typeof payload.value !== 'number') {
    return (
      <rect
        x={cx - CELL_WIDTH / 2}
        y={cy - CELL_HEIGHT / 2}
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        fill="#f0f0f0"
        stroke="#fff"
        strokeWidth={1}
        rx={4}
        ry={4}
      />
    );
  }
  return (
    <rect
      x={cx - CELL_WIDTH / 2}
      y={cy - CELL_HEIGHT / 2}
      width={CELL_WIDTH}
      height={CELL_HEIGHT}
      fill={getColor(payload.value)}
      stroke="#fff"
      strokeWidth={1}
      rx={4}
      ry={4}
    />
  );
};

interface HeatmapTooltipProps {
  active?: boolean;
  payload?: unknown[];
}

const HeatmapTooltip = ({ active, payload }: HeatmapTooltipProps) => {
  if (
    !active ||
    !payload ||
    !Array.isArray(payload) ||
    payload.length === 0 ||
    !(payload[0] as { payload?: unknown }).payload
  )
    return null;
  const { user, block, value } = (payload[0] as { payload: { user: string; block: string; value: number } }).payload;
  return (
    <div className="p-2 bg-white border rounded shadow text-sm">
      <div className="font-bold mb-1">
        {user} – {block}
      </div>
      <div className="flex items-center">
        <span
          className="w-3 h-3 mr-2 block"
          style={{ backgroundColor: getColor(value) }}
        />
        <span>Score: {roundValue(value)}/100</span>
      </div>
    </div>
  );
};

interface HeatmapChartProps {
  reportData: HeatmapEntry[];
  printMode?: boolean;
  title?: string;
}
const HeatmapChart: React.FC<HeatmapChartProps> = ({
  reportData,
  printMode = false,
  title = "Performance Heatmap"
}) => {
  const flat = useMemo(() => {
    const out: { user: string; block: string; value: number }[] = [];
    if (!reportData) return out;
    reportData.forEach((r) => {
      const userKey = `${r.userName}${r.date ? " – " + r.date : ""}`;
      r.blocks?.forEach((b) => {
        if (b && typeof b.yesPercentage === 'number') {
          out.push({ user: userKey, block: b.blockName, value: b.yesPercentage });
        }
      });
    });
    return out;
  }, [reportData]);

  const users = Array.from(new Set(flat.map((d) => d.user)));
  const blocks = Array.from(new Set(flat.map((d) => d.block)));

  if (flat.length === 0) {
    const noDataMessage = "No data available for heatmap.";
    if (printMode) {
      return <div className="w-full h-[650px] flex items-center justify-center text-gray-500">{noDataMessage} (Print Mode)</div>;
    }
    return (
      <div className="w-full max-w-6xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Each row is a user, each column a performance block. Color shows percent-yes.
        </p>
        <div className="w-full h-[600px] flex items-center justify-center text-gray-500 dark:text-gray-400">{noDataMessage}</div>
      </div>
    );
  }

  const numericData = flat.map((d) => ({
    ...d,
    cx: blocks.indexOf(d.block),
    cy: users.indexOf(d.user),
    value: d.value
  }));

  const chartHeight = Math.max(300, users.length * (CELL_HEIGHT + 5) + 150);

  const ChartOnly = () => (
    <div style={{ width: "100%", height: printMode ? 650 : chartHeight }}>
      <ScatterContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: printMode ? 30 : 20, bottom: printMode ? 120 : 100, left: printMode ? 200 : 180 }}>
          <ScatterGrid strokeDasharray="3 3" stroke="#88888880" />
          <ScatterXAxis
            type="number"
            dataKey="cx"
            name="Block"
            domain={[-0.5, blocks.length - 0.5]}
            ticks={blocks.map((_, i) => i)}
            tickFormatter={(i) => blocks[i] || ""}
            tick={{ fontSize: printMode ? 10 : 12, fill: '#333' }}
            axisLine={{ stroke: "#444" }}
            tickLine={{ stroke: "#444" }}
            angle={-45}
            textAnchor="end"
            height={printMode ? 100 : 80}
            interval={0}
          />
          <ScatterYAxis
            type="number"
            dataKey="cy"
            name="User"
            domain={[-0.5, users.length - 0.5]}
            ticks={users.map((_, i) => i)}
            tickFormatter={(i) => users[i] || ""}
            tick={{ fontSize: printMode ? 10 : 12, fill: '#333' }}
            axisLine={{ stroke: "#444" }}
            tickLine={{ stroke: "#444" }}
            width={printMode ? 180 : 150}
            reversed
            interval={0}
          />
          <ZAxis type="number" dataKey="value" range={[0, 100]} name="Score" />
          <ScatterTooltip content={<HeatmapTooltip />} cursor={{ stroke: printMode ? "#888" : "#fff", strokeWidth: printMode ? 1 : 2 }} />
          <Scatter name="Performance" data={numericData} shape={(props: unknown) => <CustomCell {...(props as CustomCellProps)} />} isAnimationActive={false} />
        </ScatterChart>
      </ScatterContainer>
    </div>
  );

  if (printMode) return <ChartOnly />;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Each row is a user, each column a performance block. Color shows percent-yes.
      </p>
      <ChartOnly />
    </div>
  );
};

// ---------------------------------------------------------------- TeamComparison helpers
function getMedian(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[m - 1] + sorted[m]) / 2
    : sorted[m];
}
const colorPalette = [
  "#4E79A7", "#F28E2B", "#59A14F", "#E15759", "#76B7B2",
  "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#BAB0AC",
  "#D4A6C8", "#86BCB6", "#F4A261", "#2A9D8F", "#E9C46A"
];

interface TeamComparisonChartProps {
  blockData: BlockDataEntry[];
  subBlockData: SubBlockDataEntry[];
  mode: 'blocks' | 'subblock';
  subBlockNameToRender?: string;
  printMode?: boolean;
  title?: string;
}
const TeamComparisonChart: React.FC<TeamComparisonChartProps> = ({
  blockData,
  subBlockData,
  mode,
  subBlockNameToRender,
  printMode = false,
  title
}) => {
  const { theme } = useTheme();
  const axisColor = theme === "dark" ? "#D1D5DB" : "#4B5563";
  const gridColor = theme === "dark" ? "#4B5563" : "#E5E7EB";
  const tooltipBg = theme === "dark" ? "#1F2937" : "#FFFFFF";
  const tooltipBorder = theme === "dark" ? "#4B5563" : "#CCCCCC";

  const blockChartData = useMemo(() => {
    if (!blockData) return [];
    return blockData.map((item) => {
      const row: Record<string, number | string> = { block: item.block };
      Object.entries(item).forEach(([k, v]) => {
        if (k !== "block") {
          const n = parseFloat(String(v));
          row[k] = isNaN(n) ? 0 : n;
        }
      });
      return row;
    });
  }, [blockData]);

  const allBlockUsersForToggle = useMemo(() => {
    const s = new Set<string>();
    blockChartData.forEach((r) =>
      Object.keys(r).forEach((k) => k !== "block" && s.add(k))
    );
    return Array.from(s);
  }, [blockChartData]);

  const subBlockChartMap = useMemo(() => {
    type SubBlockChartRow = { subblockLabel: string } & { [key: string]: number | string };
    const map: Record<string, SubBlockChartRow[]> = {};
    if (!subBlockData) return map;
    const uniqueBlockKeys = Array.from(new Set(subBlockData.map((d) => d.block)));
    uniqueBlockKeys.forEach((blockName) => {
      map[blockName] = subBlockData
        .filter((d) => d.block === blockName)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ block, subblock, ...rest }) => {
          const row: SubBlockChartRow = { subblockLabel: String(subblock) };
          Object.entries(rest).forEach(([k, v]) => {
            const n = parseFloat(String(v));
            row[k] = isNaN(n) ? 0 : n;
          });
          return row;
        });
    });
    return map;
  }, [subBlockData]);

  const currentChartData = useMemo(() => {
    if (mode === 'blocks') return blockChartData;
    if (mode === 'subblock' && subBlockNameToRender) {
      return subBlockChartMap[subBlockNameToRender] || [];
    }
    return [];
  }, [mode, blockChartData, subBlockChartMap, subBlockNameToRender]);

  const xKey = mode === 'blocks' ? "block" : "subblockLabel";

  const usersInCurrentChart = useMemo(() => {
    if (!currentChartData.length) return [];
    return Object.keys(currentChartData[0]).filter((k) => k !== xKey);
  }, [currentChartData, xKey]);

  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    setActiveUsers(usersInCurrentChart);
  }, [usersInCurrentChart]);

  const usersToDisplay = printMode ? usersInCurrentChart : activeUsers;

  const { overallAverage, medianScore, minScore, maxScore } = useMemo(() => {
    const vals: number[] = [];
    usersToDisplay.forEach((u) =>
      currentChartData.forEach((row: Record<string, number | string>) => {
        const v = row[u];
        if (typeof v === "number" && !isNaN(v)) vals.push(v);
      })
    );
    if (!vals.length) return { overallAverage: 0, medianScore: 0, minScore: 0, maxScore: 0 };
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      overallAverage: sum / vals.length,
      medianScore: getMedian(vals),
      minScore: Math.min(...vals),
      maxScore: Math.max(...vals),
    };
  }, [currentChartData, usersToDisplay]);


  const renderTooltipContent = (p: TooltipProps<number, string>) => {
    const { active, payload, label } = p;
    if (!active || !payload?.length) return null;
    return (
      <div style={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, padding: '10px', borderRadius: '5px', color: axisColor, fontSize: printMode ? '0.75rem' : '0.875rem' }}>
        <p style={{ marginBottom: '6px', fontWeight: "bold" }}>{mode === 'blocks' ? "Block" : "Sub-block"}: {label}</p>
        {payload.map((e, i: number) => {
          const v = typeof e.value === "number" ? e.value : 0;
          const diff = v - overallAverage;
          const sign = diff >= 0 ? "+" : "";
          return (<p key={i} style={{ margin: "2px 0", color: e.color }}>{e.name}: {v.toFixed(1)}% <em>({sign}{diff.toFixed(1)} from avg)</em></p>);
        })}
        {payload.length > 0 && overallAverage > 0 && (
          <p style={{ marginTop: '4px', borderTop: `1px dashed ${axisColor}`, paddingTop: '4px', fontSize: printMode ? '0.65rem' : '0.75rem'}}>Overall Avg (Active): {overallAverage.toFixed(1)}%</p>
        )}
      </div>
    );
  };

  if (printMode) {
    if (!currentChartData.length || usersInCurrentChart.length === 0) {
      return <div className="w-full h-[500px] flex items-center justify-center text-gray-500 text-sm">No data to print.</div>;
    }
    return (
      <div className="w-full" style={{ height: "500px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentChartData} margin={{ top: 5, right: 30, bottom: 90, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.7} />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: axisColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} angle={-60} textAnchor="end" interval={0} height={90} />
            <YAxis domain={[0, 120]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: axisColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} width={45}/>
            <Tooltip content={renderTooltipContent} />
            {medianScore > 0 && (
              <ReferenceLine y={medianScore} stroke="#B07AA1" strokeWidth={1.5} strokeDasharray="4 4" label={{value: `Median (${medianScore.toFixed(1)})`, position: "insideBottomRight", fill: axisColor, fontSize: 9 }}/>
            )}
            {minScore > 0 && (
              <ReferenceLine y={minScore} stroke="#E15759" strokeWidth={1} strokeDasharray="2 2" label={{value: `Min (${minScore.toFixed(1)})`, position: "insideBottomLeft", fill: axisColor, fontSize: 9 }}/>
            )}
            {maxScore > 0 && (
              <ReferenceLine y={maxScore} stroke="#59A14F" strokeWidth={1} strokeDasharray="2 2" label={{value: `Max (${maxScore.toFixed(1)})`, position: "insideTopLeft", fill: axisColor, fontSize: 9 }}/>
            )}
            {usersToDisplay.map((user) => {
              const colorIndex = (mode === 'blocks' ? allBlockUsersForToggle : usersInCurrentChart).indexOf(user);
              return (
                <Line key={user} type="monotone" dataKey={user} stroke={colorPalette[colorIndex % colorPalette.length]} strokeWidth={1.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
          {usersInCurrentChart.map((u) => {
            const colorIndex = (mode === 'blocks' ? allBlockUsersForToggle : usersInCurrentChart).indexOf(u);
            return (
              <div key={u} className="flex items-center space-x-1 text-[9px]">
                <span className="inline-block w-1.5 h-1.5" style={{ backgroundColor: colorPalette[colorIndex % colorPalette.length] }} />
                <span>{u}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Screen mode
  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
      {title && <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{title}</h3>}
      {(!currentChartData.length || usersInCurrentChart.length === 0) ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data to display for {title}.
        </div>
      ) : (
        <>
          <div style={{ height: "550px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentChartData} margin={{ top: 5, right: 20, bottom: 90, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.7} />
                <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} angle={-60} textAnchor="end" interval={0} height={90} />
                <YAxis domain={[0, 120]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: axisColor }} tickLine={{ stroke: axisColor }} width={50}/>
                <Tooltip content={renderTooltipContent} />
                {medianScore > 0 && (
                  <ReferenceLine y={medianScore} stroke="#B07AA1" strokeWidth={1.5} strokeDasharray="4 4" label={{value: `Median (${medianScore.toFixed(1)})`, position: "insideBottomRight", fill: axisColor, fontSize: 10 }}/>
                )}
                {minScore > 0 && (
                  <ReferenceLine y={minScore} stroke="#E15759" strokeWidth={1} strokeDasharray="2 2" label={{value: `Min (${minScore.toFixed(1)})`, position: "insideBottomLeft", fill: axisColor, fontSize: 10 }}/>
                )}
                {maxScore > 0 && (
                  <ReferenceLine y={maxScore} stroke="#59A14F" strokeWidth={1} strokeDasharray="2 2" label={{value: `Max (${maxScore.toFixed(1)})`, position: "insideTopLeft", fill: axisColor, fontSize: 10 }}/>
                )}
                {usersToDisplay.map((user) => {
                  const colorIndex = (mode === 'blocks' ? allBlockUsersForToggle : usersInCurrentChart).indexOf(user);
                  return (
                    <Line key={user} type="monotone" dataKey={user} stroke={colorPalette[colorIndex % colorPalette.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  );
                })}
             
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[ 
              {label: 'Avg Score', value: overallAverage.toFixed(1) + '%'}, 
              {label: 'Median Score', value: medianScore.toFixed(1) + '%'}, 
              {label: 'Min Score', value: minScore.toFixed(1) + '%'}, 
              {label: 'Max Score', value: maxScore.toFixed(1) + '%'} 
            ].map(stat => (
              <div key={stat.label} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                <span className="block text-gray-500 dark:text-gray-400 text-[10px]">{stat.label}</span>
                <span className="block font-semibold text-gray-800 dark:text-gray-200">{stat.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- page component
export default function Page() {
  const params = useParams();
  const rawId = params?.id;
  const reportId = typeof rawId === "string" ? rawId : "";

  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
  const [blockData, setBlockData] = useState<BlockDataEntry[]>([]);
  const [subBlockData, setSubBlockData] = useState<SubBlockDataEntry[]>([]);
  const [reportName, setReportName] = useState<string>("User Comparison Report");
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const subBlockCategories = useMemo(
    () => Array.from(new Set(subBlockData.map((d) => d.block).filter(Boolean))),
    [subBlockData]
  );

  useEffect(() => {
    if (!reportId) {
      setErr("Report ID is missing in the URL.");
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    setErr(null);
    setIsLoading(true);

    axios
      .get<RawApiResponse>(`https://api.panoramamas.com/api/standard-reports/${reportId}`)
      .then((res) => {
        if (!isMounted) return;
        const d = res.data;
        if (d.report_name) setReportName(d.report_name);

        const RData = d.ReportData;
        const RData2 = d.ReportData2;

        if (Array.isArray(RData)) {
          setHeatmapData(RData);
        } else {
          console.warn("ReportData is not an array or is missing", RData);
          setHeatmapData([]);
        }

        if (RData2 && typeof RData2 === 'object') {
          if (Array.isArray(RData2.Blocks)) {
            setBlockData(RData2.Blocks);
          } else {
            console.warn("ReportData2.Blocks is not an array or is missing", RData2.Blocks);
            setBlockData([]);
          }
          if (Array.isArray(RData2.Subblock1)) {
            setSubBlockData(RData2.Subblock1);
          } else {
            console.warn("ReportData2.Subblock1 is not an array or is missing", RData2.Subblock1);
            setSubBlockData([]);
          }
        } else {
          console.error("ReportData2 is missing or not an object:", RData2);
          setErr("Received invalid data structure for comparison charts.");
          setBlockData([]);
          setSubBlockData([]);
        }
        setIsLoading(false);
      })
      .catch((e: AxiosError) => {
        if (!isMounted) return;
        if (e.response) {
          setErr(`API Error: ${e.response.status} — ${e.response.statusText}`);
        } else if (e.request) {
          setErr("API Error: No response received from server.");
        } else {
          setErr(`API Error: ${e.message}`);
        }
        setHeatmapData([]);
        setBlockData([]);
        setSubBlockData([]);
        setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [reportId]);

  if (!reportId && !err && isLoading)
    return <div className="p-8 text-xl text-center">Checking report ID...</div>;
  if (!reportId && !err && !isLoading)
    return <div className="p-8 text-xl text-red-600">❗ Missing report ID</div>;

  if (isLoading)
    return <div className="p-8 text-xl text-center">Loading report data…</div>;
  if (err)
    return <div className="p-8 text-xl text-red-600">Error loading report: {err}</div>;

  if (!heatmapData.length && !blockData.length && !subBlockData.length)
    return <div className="p-8 text-xl text-center">No data found for this report.</div>;

  const today = new Date().toLocaleDateString();

  return (
    <Fragment>
      <header className="report-header W-1/2 flex justify-between items-center bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 text-sm print:fixed print:top-0 print:left-0 print:right-0 print:z-50 print:bg-white print:border-gray-300">
        <img src="/logo.png" width={130} height={50} alt="Panorama MAS" />
        <div className="text-right text-gray-700 dark:text-gray-300 print:text-black">
          <h1 className="font-semibold m-0 text-base">{reportName}</h1>
          <p className="m-0">ID: <strong>{reportId}</strong></p>
          <p className="m-0">Date: {today}</p>
        </div>
      </header>

      {/* --- On-screen content section (Interactive Charts) --- */}
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-8 print:hidden space-y-8">
        {heatmapData.length > 0 && (
          <HeatmapChart reportData={heatmapData} title="Overall Performance Heatmap" />
        )}
        {blockData.length > 0 && (
          <TeamComparisonChart
            blockData={blockData}
            subBlockData={subBlockData}
            mode="blocks"
            printMode={false}
            title="Team Comparison - Overall Blocks"
          />
        )}
        {subBlockCategories.map((cat) =>
          subBlockData.filter(d => d.block === cat).length > 0 && (
            <TeamComparisonChart
              key={cat}
              blockData={blockData}
              subBlockData={subBlockData}
              mode="subblock"
              subBlockNameToRender={cat}
              printMode={false}
              title={`Team Comparison - ${cat} Sub-blocks`}
            />
          )
        )}
      </div>

      <button
        className="print:hidden fixed bottom-4 right-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 z-40"
        onClick={() => window.print()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 inline" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
        </svg>
        Print Report
      </button>

      {/* --- Print-specific structured content (PDF Layout) --- */}
      <main className="hidden print:block mx-auto max-w-[860px]">
                       {heatmapData.length > 0 && (
          <div className="pdf-page">
            <h2 className="text-xl font-semibold mb-2 text-center">Performance Heatmap</h2>
            <HeatmapChart reportData={heatmapData} printMode={true} />
          </div>
        )}
        {blockData.length > 0 && (
          <div className="pdf-page">
            <h2 className="text-xl font-semibold mb-2 text-center">Team Comparison - Overall Blocks</h2>
            <TeamComparisonChart
              blockData={blockData}
              subBlockData={subBlockData}
              mode="blocks"
              printMode={true}
            />
          </div>
        )}
        {subBlockCategories.map((cat) =>
          subBlockData.filter(d => d.block === cat).length > 0 && (
            <div className="pdf-page" key={`print-${cat}`}>
              <h3 className="text-lg font-semibold mb-2 text-center">Team Comparison - {cat} Sub-blocks</h3>
              <TeamComparisonChart
                blockData={blockData}
                subBlockData={subBlockData}
                mode="subblock"
                subBlockNameToRender={cat}
                printMode={true}
              />
            </div>
          )
        )}
      </main>

      <footer className="report-footer flex justify-between items-center bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-3 text-xs print:fixed print:bottom-0 print:left-0 print:right-0 print:z-50 print:bg-white print:border-gray-300 text-gray-600 dark:text-gray-400 print:text-black">
        <p className="m-0">© {new Date().getFullYear()} Panorama Management Advisory Services</p>
        <span className="m-0">Confidential & Proprietary</span>
      </footer>

      <style jsx global>{`
@media print {
  /* hide on-screen interactive parts */
  .print\:hidden { display: none !important; }
  /* show print-only sections */
  .print\:block { display: block !important; }

  /* force each .pdf-page onto its own sheet */
  .pdf-page {
    page-break-after: always;
    break-inside: avoid;
  }
  /* don't leave an extra blank page after the last one */
  .pdf-page:last-child {
    page-break-after: auto;
  }

  /* set paper size + margins */
  @page {
    size: A4 portrait;
    margin: 20mm 10mm 15mm;
  }
}


      `}</style>
    </Fragment>
  );
}
