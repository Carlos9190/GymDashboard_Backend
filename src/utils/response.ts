type ApiResponse<T> = {
    message: string
    success: boolean
    data: T
}

export function createResponse<T>(message: string, success: boolean, data?: T): ApiResponse<T> {
    return { message, success, data }
}