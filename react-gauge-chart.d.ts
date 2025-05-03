declare module "react-gauge-chart" {
  const GaugeChart: React.FC<{
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    nrOfLevels?: number;
    colors?: string[];
    arcWidth?: number;
    percent: number;
    textColor?: string;
    needleColor?: string;
    needleBaseColor?: string;
  }>;

  export default GaugeChart;
}
