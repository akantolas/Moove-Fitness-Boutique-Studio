export function parsePagination(query = {}) {
  const page = Number(query.page ?? 1)
  const pageSize = Number(query.pageSize ?? 20)
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > 100000 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  )
    throw new Error('invalid_pagination')
  return {
    page,
    pageSize,
    from: (page - 1) * pageSize,
    to: page * pageSize - 1,
  }
}
