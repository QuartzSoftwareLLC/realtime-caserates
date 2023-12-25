import styled from "styled-components";
import axios from "axios";
import React from "react";
import Papa from "papaparse";

const Table = styled.table`
  border-collapse: collapse;
  td,
  th {
    border: 1px solid black;
    padding: 0.5rem;
  }
`;

export default function Page() {
  const [data, setData] = React.useState("");
  React.useEffect(() => {
    axios
      .get("http://quartzdata.s3.amazonaws.com/datasets/avg-final.csv")
      // .get("http://quartzdata.s3.amazonaws.com/stats/aggregate_annual_rate_latest.json")
      .then((res) => setData(Papa.parse(res.data.trim()).data));
  }, []);

  return (
    <div>
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
                {x.map((y) => (
                  <td>{y?.toLocaleString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
