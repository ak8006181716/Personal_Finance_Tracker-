class ApiResponse {
    constructor(StatusCode, data, massage= "Success"){
        this.StatusCode = StatusCode
        this.data = data
        this.massage= massage
        this.success = StatusCode < 400
    }
}
export { ApiResponse };
export default ApiResponse;