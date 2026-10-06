/**
 * Renders a SQL result set as a scrollable pixel table.
 *
 * Purely presentational: it takes whatever columns/rows the backend returned
 * and does no inspection of the data itself.
 */
export function ResultTable({ columns = [], rows = [] }) {
  if (rows.length === 0) {
    return (
      <p className="label" style={{ marginTop: "0.5rem" }}>
        No rows returned.
      </p>
    );
  }

  // Some drivers return non-string values; stringify defensively for display.
  const headerCells = columns.length > 0 ? columns : Object.keys(rows[0]);

  return (
    <div className="result-table-wrap">
      <table className="result-table">
        <thead>
          <tr>
            {headerCells.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headerCells.map((column) => (
                <td key={column}>
                  {row[column] === null || row[column] === undefined
                    ? "—"
                    : String(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
