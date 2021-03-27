import React from "react";
//
// import useChartConfig from "hooks/useChartConfig";
// import Box from "components/Box";
// import SyntaxHighlighter from "components/SyntaxHighlighter";
import { Chart } from "react-google-charts";

const ReactScatterChart = ({
  data,
  title = "My Chart",
  yLabel = "Y axis",
  xLabel = "X axis",
  minX,
  maxX,
  minY,
  maxY,
}) => {
  const xAxisObj = { title: xLabel };
  const yAxisObj = { title: yLabel };
  if ((minX || minX === 0) && (maxX || maxX === 0)) {
    xAxisObj.minValue = minX;
    xAxisObj.maxValue = maxX;
  }
  if ((minY || minY === 0) && (maxY || maxY === 0)) {
    yAxisObj.minValue = minY;
    yAxisObj.maxValue = maxY;
  }
  return (
    <>
      <div>
        <Chart
          width={"500px"}
          height={"400px"}
          chartType="ScatterChart"
          loader={<div>Loading Chart</div>}
          data={data}
          options={{
            title,
            hAxis: xAxisObj,
            vAxis: yAxisObj,
            legend: "none",
          }}
          rootProps={{ "data-testid": "1" }}
        />
      </div>
      <br />
    </>
  );
};

export default ReactScatterChart;
