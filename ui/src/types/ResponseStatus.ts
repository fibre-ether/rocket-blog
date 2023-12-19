export type ResponseResultStatus = "success" | "failure"

export type ResponseResult = {
    status: ResponseResultStatus,
    error?: string
}