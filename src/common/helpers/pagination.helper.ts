import { PaginationDto } from '../dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export const paginate = <T>(
  data: T[],
  total: number,
  paginationDto: PaginationDto,
): PaginatedResult<T> => {
  const { page = 1, limit = 10 } = paginationDto;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page < lastPage ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage: limit,
      prev: prevPage,
      next: nextPage,
    },
  };
};

export const createPaginator = (
  defaultOptions: PaginationDto = { page: 1, limit: 10 },
) => {
  return (dto: PaginationDto) => {
    const page = Number(dto.page || defaultOptions.page);
    const limit = Number(dto.limit || defaultOptions.limit);
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
      page,
      limit,
    };
  };
};
