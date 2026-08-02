

export default function TableSkeleton({ rows = 4 }) {
  return (
    <div className="table-wrap" aria-busy="true" aria-label="Loading tasks">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Category</th>
            <th>Due</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><span className="skeleton-block" style={{ width: '70%' }} /></td>
              <td><span className="skeleton-block" style={{ width: '60%' }} /></td>
              <td><span className="skeleton-block" style={{ width: '50%' }} /></td>
              <td><span className="skeleton-block skeleton-pill" /></td>
              <td><span className="skeleton-block" style={{ width: '80%' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
