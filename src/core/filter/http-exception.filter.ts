// import {ArgumentsHost,Catch, ExceptionFilter, HttpException} from '@nestjs/common';

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp(); // 获取请求上下文
//     const response = ctx.getResponse(); // 获取请求上下文中的 response对象
//     const status = exception.getStatus(); // 获取异常状态码

//     // 设置错误信息
//     const message = exception.message
//       ? exception.message
//       : `${status >= 500 ? 'Service Error' : 'Client Error'}`;
//     const errorResponse = {
//       data: {},
//       message: message,
//       code: -1,
//     };

//     // 设置返回的状态码， 请求头，发送错误信息
//     response.status(status);
//     response.header('Content-Type', 'application/json; charset=utf-8');
//     response.send(errorResponse);
//   }
// }
// src/filter/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../../utils/log4js';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const logFormat = ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    Request original url: ${request.originalUrl}
    Method: ${request.method}
    IP: ${request.ip}
    Status code: ${status}
    Response: ${exception.toString()} \n  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    `;
    Logger.info(logFormat);
    response.status(status).json({
      statusCode: status,
      error: exception.message,
      msg: `${status >= 500 ? 'Service Error' : 'Client Error'}`,
    });
    
  }
}