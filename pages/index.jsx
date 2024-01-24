import styled from "styled-components";
import axios from "axios";
import React from "react";
import Papa from "papaparse";
import dynamic from "next/dynamic";
import { zip } from "lodash";

const PlotParent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`;

const NewestData = styled.p`
  margin: 0;
  margin-left: 1rem;
`;
const prosserFill = "red";
const highFill = "green";
const lowFill = "blue";

const Plot = dynamic(import("react-plotly.js"), {
  ssr: false,
});
const Figure = () => {
  const data = useData("trend-hospitalizations");
  let formatted_data;
  if (data) {
    formatted_data = zip(...data).reduce(
      (acc, x) => ({ ...acc, [x[0]]: x.slice(1) }),
      {}
    );
  }
  const timeData = [
    {
      start: "2022-12-03",
      label: "2022-12-10",
      end: "2023-05-27",
      fillcolor: prosserFill,
      text: "Prosser",
    },
    {
      start: "2021-10-02",
      label: "2021-10-09",
      end: "2022-09-24",
      text: "High Scenario",
      fillcolor: highFill,
    },
    {
      start: "2022-04-02",
      label: "2022-04-09",
      end: "2023-03-25",
      text: "Low Scenario",
      fillcolor: lowFill,
    },
    {
      end: formatted_data?.["week_ending_date"][0],
      label: formatted_data?.["week_ending_date"][50],
      start: formatted_data?.["week_ending_date"][51],
      text: "Latest Data",
      fillcolor: "orange",
    },
  ];
  return data ? (
    <PlotParent>
      <Plot
        data={[
          {
            x: formatted_data["week_ending_date"],
            y: formatted_data["rate"],
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "black" },
          },
          {
            mode: "text",
            x: timeData.map((x) => x.label),
            y: [-1.5, -4.5, -7.5, -10.5],
            text: timeData.map((x) => x.text),
            textposition: "right",
          },
        ]}
        layout={{
          width: "100%",
          shapes: [
            ...timeData.map((x, i) => ({
              type: "rect",
              xref: "x",
              // yref: "paper",
              fillcolor: x.fillcolor,
              x0: x.start,
              x1: x.end,
              opacity: 0.2,
              line: {
                width: 0,
              },
              y1: -i * 3,
              y0: (-i - 1) * 3,
            })),
          ],
          height: "100%",
          title: "Hospitalization Trends",
          showlegend: false,
          xaxis: { title: "Week" },
          yaxis: { title: "Hospitalization Rate" },
        }}
      />
    </PlotParent>
  ) : (
    <p>Loading...</p>
  );
};

const Table = styled.table`
  border-collapse: collapse;
  td,
  th {
    border: 1px solid black;
    padding: 0.5rem;
  }
  .bold {
    color: red;
  }
`;

const useData = (key) => {
  const [data, setData] = React.useState("");

  React.useEffect(() => {
    axios
      // http if http otherwise https
      .get(
        window.location.protocol === "http:"
          ? `http://quartzdata.s3.amazonaws.com/datasets/${key}.csv`
          : `https://quartzdata.s3.amazonaws.com/datasets/${key}.csv`
      )
      // .get("http://quartzdata.s3.amazonaws.com/stats/aggregate_annual_rate_latest.json")
      .then((res) =>
        setData(Papa.parse(res.data.trim(), { delimiter: "," }).data)
      );
  }, []);

  return data;
};

export default function Page() {
  const data = useData("avg-final");
  const dates = useData("avg-final-dates");

  return (
    <div>
      <h1>COVID 19 Realtime Data</h1>
      {data && (
        <Table>
          <thead>
            <tr>
              {data[0].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1, data.length).map((x) => (
              <tr key={x}>
                {x.map((y) => {
                  const parsed = parseFloat(y);

                  return parsed.toString() == "NaN" ? (
                    <td key={y}>{y}</td>
                  ) : y.includes("%") ? (
                    <td key={y} className="bold">
                      {y}
                    </td>
                  ) : (
                    <td key={y}>{parsed.toLocaleString("en-US")}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ul>
        {zip(...dates).map(([x, y]) => (
          <li key={x}>
            {x} {y}
          </li>
        ))}
      </ul>
      <Figure />
    </div>
  );
}
