import styled from "styled-components";
import axios from "axios";
import React from "react";
import Papa from "papaparse";
import dynamic from "next/dynamic";
import { zip } from "lodash";
import Head from 'next/head'

const niceBlue = "#475C7A";
const niceRed = "#D8737F";

const PlotParent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  padding: 1rem;
  // background-color: #F2F3F4;
  font-family: Arial;
  h1,
  h2 {
    color: ${niceBlue};
  }
  .styled-table {
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    max-width: 100%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    transition: 0.3s;
  }
  .bold {
    color: ${niceRed};
  }

  .table-wrapper {
    max-width: 100%;
    overflow-x: auto;
  }

  .styled-table thead tr {
    background-color: ${niceBlue};
    color: #ffffff;
    text-align: left;
  }
  .styled-table th,
  .styled-table td {
    padding: 12px 15px;
  }
  .styled-table tbody tr {
    border-bottom: 1px solid #dddddd;
  }

  .styled-table tbody tr:nth-of-type(even) {
    background-color: #f3f3f3;
  }

  .styled-table tbody tr.active-row {
    font-weight: bold;
    color: #009879;
  }

  .styled-table td:first-child,
  th:first-child {
    border-left: none;
  }

  .data-wrapper {
    display: flex;
    justify-content: center;
    flex-direction: column;
  }

  .reference {
    color: ${niceBlue};
  }

  .card {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    transition: 0.3s;
    border-radius: 5px; /* 5px rounded corners */
  }
`;

const HospitalizationWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
  * {
    flex: 1;
  }
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
  const data = useData("trend-hospitalizations.csv");
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
          autosize: true,
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

const get_quartz_asset = (key) => {
  return axios.get(
    window.location.protocol === "http:"
      ? `http://quartzdata.s3.amazonaws.com/datasets/${key}`
      : `https://quartzdata.s3.amazonaws.com/datasets/${key}`
  );
};

const useData = (key) => {
  const [data, setData] = React.useState("");

  React.useEffect(() => {
    get_quartz_asset(key)
      // .get("http://quartzdata.s3.amazonaws.com/stats/aggregate_annual_rate_latest.json")
      .then((res) =>
        setData(Papa.parse(res.data.trim(), { delimiter: "," }).data)
      );
  }, []);

  return data;
};

function Dates() {
  const [dates, setDates] = React.useState({});
  React.useEffect(() => {
    get_quartz_asset("covid-dates.json").then((res) => setDates(res.data));
  }, []);
  return (
    <>
      {Object.entries(dates).map(([k, v]) => (
        <ul class="reference">
          {k}: {v}
        </ul>
      ))}
    </>
  );
}

export default function Page() {
  const data = useData("covid.csv");
  const hospitalizations = useData("hospitalizations-by-age.csv");

  return (
    <Container>
      <Head>
        <meta http-equiv="cache-control" content="max-age=0" />
        <meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv="expires" content="0" />
        <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
        <meta http-equiv="pragma" content="no-cache" />
      </Head>
      <h1>COVID 19 Realtime Data</h1>
      <p>
        This real-time dashboard provides insights into current trends of COVID
        19 based on metrics including testing, hospitalizations, and deaths. The
        data below is refreshed daily from a variety of CDC provided sources.
        See <a href="#data-info">Data Info</a> below for more information.
      </p>
      <div class="data-wrapper">
        {data && (
          <div class="table-wrapper">
            <table class="styled-table">
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
            </table>
          </div>
        )}
        <ul>
          <li>
            Prosser 2023 cases are annualized based on data from December 2022
            through May 2023
          </li>
          <li>
            Prosser 2023 hospitalizations and deaths are annualized based on
            data from October 2022 through March 2023
          </li>
          <li>
            Prosser 2024 cases, hospitalizations and deaths are annualized based
            on data from April 2023 through September 2023
          </li>
        </ul>
        <h2>Hospitalization Data</h2>
        <HospitalizationWrapper>
          <Figure />
          {hospitalizations && (
            <div class="table-wrapper">
              <table class="styled-table">
                <thead>
                  <tr>
                    {hospitalizations[0].map((x) => (
                      <th key={x}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hospitalizations
                    .slice(1, hospitalizations.length)
                    .map((x) => (
                      <tr key={x}>
                        {x.map((y) => {
                          return <td key={y}>{y}</td>;
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </HospitalizationWrapper>
        <h2 id="data-info">Data Info</h2>
        <Dates />
      </div>
    </Container>
  );
}
