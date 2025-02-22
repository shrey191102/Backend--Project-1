class ApiResponse {
    constructor(statusCode,data,messaage="success"){
        this.statusCode=statusCode;
        this.data=data;
        this.message=messaage;
        this.success=statusCode < 400
    }
}