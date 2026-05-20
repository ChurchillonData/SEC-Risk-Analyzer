/* Risk timeline chart for recent SEC filing analysis results. */

import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { RiskLevel, RiskTrendPoint, RiskTrendResponse } from "../types";
import { formatDate } from "../utils/format";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PADDING_LEFT = 42;
const PADDING_RIGHT = 18;
const PADDING_TOP = 26;
const PADDING_BOTTOM = 46;

const riskLevelCopy: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

const riskLevelColor: Record<RiskLevel, string> = {
  low: "#16A34A",
  medium: "#D97706",
  high: "#DC2626"
};

interface ChartPoint {
  point: RiskTrendPoint;
  x: number;
  y: number;
}

export function RiskTrendChart({
  error,
  isLoading,
  trend
}: {
  error: string | null;
  isLoading: boolean;
  trend: RiskTrendResponse | null;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sortedPoints = useMemo(() => {
    return [...(trend?.points ?? [])].sort((first, second) =>
      first.filed_at.localeCompare(second.filed_at)
    );
  }, [trend]);

  if (isLoading) {
    return <TrendMessage message="Building risk trend from recent filings..." pulse />;
  }

  if (error) {
    return <TrendMessage message={`Risk trend unavailable: ${error}`} />;
  }

  if (!trend || sortedPoints.length < 2) {
    return <TrendMessage message="Run an analysis to build a multi-filing risk trend." />;
  }

  const latestIndex = sortedPoints.length - 1;
  const selectedIndex = Math.min(activeIndex ?? latestIndex, latestIndex);
  const activePoint = sortedPoints[selectedIndex];
  const chartPoints = buildChartPoints(sortedPoints);
  const chartPath = chartPoints.map((item) => `${item.x},${item.y}`).join(" L ");

  return (
    <section className="trend-panel">
      <div className="panel-title-row">
        <div className="trend-heading">
          <TrendingUp size={17} />
          <h2>Risk Trend</h2>
        </div>
        <span>{sortedPoints.length} recent filings</span>
      </div>

      <div className="trend-body">
        <svg
          className="trend-chart"
          role="img"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          aria-label="Risk score trend across recent filings"
        >
          <line
            className="trend-axis"
            x1={PADDING_LEFT}
            y1={CHART_HEIGHT - PADDING_BOTTOM}
            x2={CHART_WIDTH - PADDING_RIGHT}
            y2={CHART_HEIGHT - PADDING_BOTTOM}
          />
          <line
            className="trend-axis"
            x1={PADDING_LEFT}
            y1={PADDING_TOP}
            x2={PADDING_LEFT}
            y2={CHART_HEIGHT - PADDING_BOTTOM}
          />
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = PADDING_TOP + (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM) * ratio;
            return (
              <line
                className="trend-grid-line"
                key={ratio}
                x1={PADDING_LEFT}
                y1={y}
                x2={CHART_WIDTH - PADDING_RIGHT}
                y2={y}
              />
            );
          })}

          <path className="trend-line" d={`M ${chartPath}`} />

          {chartPoints.map((item, index) => (
            <g key={item.point.accession_number}>
              <circle
                className={index === selectedIndex ? "trend-dot active" : "trend-dot"}
                cx={item.x}
                cy={item.y}
                fill={riskLevelColor[item.point.risk_level]}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                r={index === selectedIndex ? 6 : 4.5}
                tabIndex={0}
              >
                <title>
                  {item.point.form_type} filed {formatDate(item.point.filed_at)}: risk{" "}
                  {item.point.risk_score.toFixed(2)}
                </title>
              </circle>
              <text className="trend-date-label" x={item.x} y={CHART_HEIGHT - 18}>
                {formatShortDate(item.point.filed_at)}
              </text>
              <text className="trend-form-label" x={item.x} y={CHART_HEIGHT - 33}>
                {item.point.form_type}
              </text>
            </g>
          ))}
        </svg>

        <TrendDetails point={activePoint} />
      </div>
    </section>
  );
}

function TrendDetails({ point }: { point: RiskTrendPoint }) {
  return (
    <aside className="trend-detail-card">
      <span>Selected filing</span>
      <strong>
        {point.form_type} · {formatDate(point.filed_at)}
      </strong>
      <dl>
        <div>
          <dt>Risk score</dt>
          <dd>{point.risk_score.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Risk level</dt>
          <dd className={`tone-text-${point.risk_level}`}>{riskLevelCopy[point.risk_level]}</dd>
        </div>
        <div>
          <dt>Uncertainty</dt>
          <dd>{point.uncertainty_score.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Top driver</dt>
          <dd>{point.top_driver ?? "No dominant driver"}</dd>
        </div>
      </dl>
    </aside>
  );
}

function TrendMessage({ message, pulse = false }: { message: string; pulse?: boolean }) {
  return (
    <section className={pulse ? "trend-panel trend-loading" : "trend-panel"}>
      <div className="trend-heading">
        <TrendingUp size={17} />
        <h2>Risk Trend</h2>
      </div>
      <p className="muted-panel-text">{message}</p>
    </section>
  );
}

function buildChartPoints(points: RiskTrendPoint[]): ChartPoint[] {
  const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const maxRisk = Math.max(...points.map((point) => point.risk_score), 12);

  return points.map((point, index) => {
    const x = PADDING_LEFT + (index / Math.max(points.length - 1, 1)) * innerWidth;
    const y = PADDING_TOP + innerHeight - (point.risk_score / maxRisk) * innerHeight;
    return { point, x, y };
  });
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "2-digit"
  }).format(new Date(value));
}
