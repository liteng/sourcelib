enum ErrorCode {
    SUCCESS = 0, // 成功
    SYS_ERROR = 1000,   // 系统错误
    INVALID_PARAMETER = 1001, // 参数无效
    DATABASE_ERROR = 2001, // 数据库错误
    UPLOAD_FASILED = 3001,  // 上传失败
    LOGIN_FAILED = 4001,    // 登录验证失败
    // ...
}

export default ErrorCode;