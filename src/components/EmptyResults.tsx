export function EmptyResults({ table = false }: { table?: boolean }) {
  const message = (
    <p className="search-empty" role="status">
      No matching records found. Try another search or clear the filter.
    </p>
  );
  return table ? (
    <tr>
      <td colSpan={8}>{message}</td>
    </tr>
  ) : (
    message
  );
}
