/**
 * Helper to normalise any paginated API response into the standard envelope.
 * Used by all service getAll() methods.
 */
const toPaginatedEnvelope = (data, page, page_size, possibleDataKeys = []) => {
  if (Array.isArray(data)) {
    return { data, total: data.length, page, page_size, total_pages: 1 };
  }
  const items = possibleDataKeys.reduce((acc, key) => acc || data?.[key], null) || [];
  return {
    data: Array.isArray(items) ? items : [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    page_size: data?.page_size ?? page_size,
    total_pages: data?.total_pages ?? 1,
  };
};

module.exports = { toPaginatedEnvelope };
