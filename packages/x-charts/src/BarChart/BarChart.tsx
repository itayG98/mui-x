import * as React from 'react';
import useId from '@mui/utils/useId';
import PropTypes from 'prop-types';
import { BarPlot } from './BarPlot';
import {
  ResponsiveChartContainer,
  ResponsiveChartContainerProps,
} from '../ResponsiveChartContainer';
import { ChartsAxis, ChartsAxisProps } from '../ChartsAxis';
import { BarSeriesType } from '../models/seriesType/bar';
import { MakeOptional } from '../models/helpers';
import { DEFAULT_X_AXIS_KEY } from '../constants';
import { ChartsTooltip, ChartsTooltipProps } from '../ChartsTooltip';
import { ChartsLegend, ChartsLegendProps } from '../ChartsLegend';
import { ChartsAxisHighlight, ChartsAxisHighlightProps } from '../ChartsAxisHighlight';
import { ChartsClipPath } from '../ChartsClipPath';

export interface BarChartProps
  extends Omit<ResponsiveChartContainerProps, 'series'>,
    ChartsAxisProps {
  series: MakeOptional<BarSeriesType, 'type'>[];
  tooltip?: ChartsTooltipProps;
  axisHighlight?: ChartsAxisHighlightProps;
  legend?: ChartsLegendProps;
}

const BarChart = React.forwardRef(function BarChart(props: BarChartProps, ref) {
  const {
    xAxis,
    yAxis,
    series,
    width,
    height,
    margin,
    colors,
    sx,
    tooltip,
    axisHighlight,
    legend,
    topAxis,
    leftAxis,
    rightAxis,
    bottomAxis,
    children,
  } = props;

  const id = useId();
  const clipPathId = `${id}-clip-path`;

  return (
    <ResponsiveChartContainer
      ref={ref}
      series={series.map((s) => ({ type: 'bar', ...s }))}
      width={width}
      height={height}
      margin={margin}
      xAxis={
        xAxis ?? [
          {
            id: DEFAULT_X_AXIS_KEY,
            scaleType: 'band',
            data: Array.from(
              { length: Math.max(...series.map((s) => s.data.length)) },
              (_, index) => index,
            ),
          },
        ]
      }
      yAxis={yAxis}
      colors={colors}
      sx={sx}
      disableAxisListener={
        tooltip?.trigger !== 'axis' && axisHighlight?.x === 'none' && axisHighlight?.y === 'none'
      }
    >
      <g clipPath={`url(#${clipPathId})`}>
        <BarPlot />
      </g>
      <ChartsAxis
        topAxis={topAxis}
        leftAxis={leftAxis}
        rightAxis={rightAxis}
        bottomAxis={bottomAxis}
      />
      <ChartsLegend {...legend} />
      <ChartsAxisHighlight x="band" {...axisHighlight} />
      <ChartsTooltip {...tooltip} />
      <ChartsClipPath id={clipPathId} />
      {children}
    </ResponsiveChartContainer>
  );
});

BarChart.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  axisHighlight: PropTypes.shape({
    x: PropTypes.oneOf(['band', 'line', 'none']),
    y: PropTypes.oneOf(['line', 'none']),
  }),
  /**
   * Indicate which axis to display the bottom of the charts.
   * Can be a string (the id of the axis) or an object `ChartsXAxisProps`.
   * @default xAxisIds[0] The id of the first provided axis
   */
  bottomAxis: PropTypes.oneOfType([
    PropTypes.shape({
      axisId: PropTypes.string.isRequired,
      classes: PropTypes.object,
      disableLine: PropTypes.bool,
      disableTicks: PropTypes.bool,
      fill: PropTypes.string,
      label: PropTypes.string,
      labelFontSize: PropTypes.number,
      position: PropTypes.oneOf(['bottom', 'top']),
      stroke: PropTypes.string,
      tickFontSize: PropTypes.number,
      tickSize: PropTypes.number,
    }),
    PropTypes.string,
  ]),
  children: PropTypes.node,
  className: PropTypes.string,
  /**
   * Color palette used to colorize multiple series.
   */
  colors: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.func]),
  desc: PropTypes.string,
  disableAxisListener: PropTypes.bool,
  height: PropTypes.number,
  /**
   * Indicate which axis to display the left of the charts.
   * Can be a string (the id of the axis) or an object `ChartsYAxisProps`.
   * @default yAxisIds[0] The id of the first provided axis
   */
  leftAxis: PropTypes.oneOfType([
    PropTypes.shape({
      axisId: PropTypes.string.isRequired,
      classes: PropTypes.object,
      disableLine: PropTypes.bool,
      disableTicks: PropTypes.bool,
      fill: PropTypes.string,
      label: PropTypes.string,
      labelFontSize: PropTypes.number,
      position: PropTypes.oneOf(['left', 'right']),
      stroke: PropTypes.string,
      tickFontSize: PropTypes.number,
      tickSize: PropTypes.number,
    }),
    PropTypes.string,
  ]),
  legend: PropTypes.shape({
    classes: PropTypes.object,
    direction: PropTypes.oneOf(['column', 'row']),
    hidden: PropTypes.bool,
    itemWidth: PropTypes.number,
    markSize: PropTypes.number,
    offset: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    position: PropTypes.shape({
      horizontal: PropTypes.oneOf(['left', 'middle', 'right']).isRequired,
      vertical: PropTypes.oneOf(['bottom', 'middle', 'top']).isRequired,
    }),
    spacing: PropTypes.number,
  }),
  margin: PropTypes.shape({
    bottom: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    top: PropTypes.number,
  }),
  /**
   * Indicate which axis to display the right of the charts.
   * Can be a string (the id of the axis) or an object `ChartsYAxisProps`.
   * @default null
   */
  rightAxis: PropTypes.oneOfType([
    PropTypes.shape({
      axisId: PropTypes.string.isRequired,
      classes: PropTypes.object,
      disableLine: PropTypes.bool,
      disableTicks: PropTypes.bool,
      fill: PropTypes.string,
      label: PropTypes.string,
      labelFontSize: PropTypes.number,
      position: PropTypes.oneOf(['left', 'right']),
      stroke: PropTypes.string,
      tickFontSize: PropTypes.number,
      tickSize: PropTypes.number,
    }),
    PropTypes.string,
  ]),
  series: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      data: PropTypes.arrayOf(PropTypes.number).isRequired,
      highlightScope: PropTypes.shape({
        faded: PropTypes.oneOf(['global', 'none', 'series']),
        highlighted: PropTypes.oneOf(['item', 'none', 'series']),
      }),
      id: PropTypes.string,
      label: PropTypes.string,
      stack: PropTypes.string,
      stackOffset: PropTypes.oneOf(['diverging', 'expand', 'none', 'silhouette', 'wiggle']),
      stackOrder: PropTypes.oneOf([
        'appearance',
        'ascending',
        'descending',
        'insideOut',
        'none',
        'reverse',
      ]),
      type: PropTypes.oneOf(['bar']),
      valueFormatter: PropTypes.func,
      xAxisKey: PropTypes.string,
      yAxisKey: PropTypes.string,
    }),
  ).isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  title: PropTypes.string,
  tooltip: PropTypes.shape({
    axisContent: PropTypes.elementType,
    classes: PropTypes.object,
    itemContent: PropTypes.elementType,
    trigger: PropTypes.oneOf(['axis', 'item', 'none']),
  }),
  /**
   * Indicate which axis to display the top of the charts.
   * Can be a string (the id of the axis) or an object `ChartsXAxisProps`.
   * @default null
   */
  topAxis: PropTypes.oneOfType([
    PropTypes.shape({
      axisId: PropTypes.string.isRequired,
      classes: PropTypes.object,
      disableLine: PropTypes.bool,
      disableTicks: PropTypes.bool,
      fill: PropTypes.string,
      label: PropTypes.string,
      labelFontSize: PropTypes.number,
      position: PropTypes.oneOf(['bottom', 'top']),
      stroke: PropTypes.string,
      tickFontSize: PropTypes.number,
      tickSize: PropTypes.number,
    }),
    PropTypes.string,
  ]),
  viewBox: PropTypes.shape({
    height: PropTypes.number,
    width: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  width: PropTypes.number,
  xAxis: PropTypes.arrayOf(
    PropTypes.shape({
      axisId: PropTypes.string,
      classes: PropTypes.object,
      data: PropTypes.array,
      disableLine: PropTypes.bool,
      disableTicks: PropTypes.bool,
      fill: PropTypes.string,
      id: PropTypes.string,
      label: PropTypes.string,
      labelFontSize: PropTypes.number,
      max: PropTypes.number,
      maxTicks: PropTypes.number,
      min: PropTypes.number,
      minTicks: PropTypes.number,
      position: PropTypes.oneOf(['bottom', 'left', 'right', 'top']),
      scaleType: PropTypes.oneOf(['band', 'linear', 'log', 'point', 'pow', 'sqrt', 'time', 'utc']),
      stroke: PropTypes.string,
      tickFontSize: PropTypes.number,
      tickSize: PropTypes.number,
      tickSpacing: PropTypes.number,
      valueFormatter: PropTypes.func,
    }),
  ),
  yAxis: PropTypes.arrayOf(
    PropTypes.shape({
      axisId: PropTypes.string,
      classes: PropTypes.object,
      data: PropTypes.array,
      disableLine: PropTypes.bool,
      disableTicks: PropTypes.bool,
      fill: PropTypes.string,
      id: PropTypes.string,
      label: PropTypes.string,
      labelFontSize: PropTypes.number,
      max: PropTypes.number,
      maxTicks: PropTypes.number,
      min: PropTypes.number,
      minTicks: PropTypes.number,
      position: PropTypes.oneOf(['bottom', 'left', 'right', 'top']),
      scaleType: PropTypes.oneOf(['band', 'linear', 'log', 'point', 'pow', 'sqrt', 'time', 'utc']),
      stroke: PropTypes.string,
      tickFontSize: PropTypes.number,
      tickSize: PropTypes.number,
      tickSpacing: PropTypes.number,
      valueFormatter: PropTypes.func,
    }),
  ),
} as any;

export { BarChart };
