class ApiResponse {
    constructor(StatusCode, data, massage = "Success") {
        this.StatusCode = StatusCode;
        this.data = data;
        // Keep legacy field 'massage' but also expose standard 'message'
        this.massage = massage;
        this.message = massage;
        this.success = StatusCode < 400;
    }
}
export { ApiResponse };
export default ApiResponse;