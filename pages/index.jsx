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

const Plot = dynamic(import("react-plotly.js"), {
  ssr: false,
});
const Figure = () => {
  const data = useData("trend-hospitalizations");
  let formatted_data;
  if (data) {
    formatted_data = zip(...data).reduce(
      (acc, x) => ({ ...acc, [x[0]]: x.slice(2) }),
      {}
    );
  }

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
        ]}
        layout={{
          width: "100%",
          height: "100%",
          title: "Hospitalization Trends",
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
              <tr>
                {x.map((y) => {
                  const parsed = parseFloat(y);

                  return parsed.toString() == "NaN" ? (
                    <td>{y}</td>
                  ) : y.includes("%") ? (
                    <td className="bold">{y}</td>
                  ) : (
                    <td>{parsed.toLocaleString("en-US")}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ul>
        {zip(...dates).map(([x, y]) => (
          <li>
            {x} {y}
          </li>
        ))}
      </ul>
      <Figure />
    </div>
  );
}
