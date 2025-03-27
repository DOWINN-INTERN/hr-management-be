// import { plainToInstance } from 'class-transformer';
// import { Repository } from 'typeorm';

// // Interfaces for pagination, sorting, and filtering
// interface PaginationParams {
//     page?: number;
//     limit?: number;
// }

// interface SortParams {
//     field: string;
//     order: 'ASC' | 'DESC';
// }

// interface FilterParams {
//     [key: string]: any;
// }

// interface PaginatedResponse<T> {
//     data: T[];
//     total: number;
//     page: number;
//     totalPages: number;
// }

// // Generic base query builder service
// export abstract class BaseQueryBuilderService<T> {
//     protected abstract repository: Repository<T extends>;
//     protected abstract dtoClass: new (...args: any[]) => any;

//     protected applyFilters(queryBuilder: any, filter?: FilterParams): void {
//         if (filter) {
//             Object.keys(filter).forEach(key => {
//                 if (filter[key]) {
//                     if (typeof filter[key] === 'string') {
//                         queryBuilder.andWhere(`${queryBuilder.alias}.${key} ILIKE :${key}`, {
//                             [key]: `%${filter[key]}%`
//                         });
//                     } else {
//                         queryBuilder.andWhere(`${queryBuilder.alias}.${key} = :${key}`, {
//                             [key]: filter[key]
//                         });
//                     }
//                 }
//             });
//         }
//     }

//     protected applySorting(queryBuilder: any, sort: SortParams): void {
//         queryBuilder.orderBy(`${queryBuilder.alias}.${sort.field}`, sort.order);
//     }

//     protected applyPagination(queryBuilder: any, skip: number, limit: number): void {
//         queryBuilder.skip(skip).take(limit);
//     }

//     async findAll(
//         pagination: PaginationParams = {},
//         sort: SortParams = { field: 'createdAt', order: 'DESC' },
//         filter?: FilterParams
//     ): Promise<PaginatedResponse<T>> {
//         const page = pagination.page || 1;
//         const limit = pagination.limit || 10;
//         const skip = (page - 1) * limit;

//         const queryBuilder = this.repository.createQueryBuilder(this.repository.metadata.tableName);

//         this.applyFilters(queryBuilder, filter);
//         this.applySorting(queryBuilder, sort);
//         this.applyPagination(queryBuilder, skip, limit);

//         const [items, total] = await queryBuilder.getManyAndCount();
//         const totalPages = Math.ceil(total / limit);

//         return {
//             data: plainToInstance(this.dtoClass, items),
//             total,
//             page,
//             totalPages
//         };
//     }
// }
