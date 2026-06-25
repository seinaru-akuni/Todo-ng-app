export interface TaskDto {
    id: number;
    description: string;
    isCompleted: boolean;
    categoryId?: number | null;
    categoryName?: string | null;
}

export interface PagedResultDto<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface TaskCreateUpdateDto {
    description: string;
    categoryId?: number | null;
    categoryName?: string | null;
}