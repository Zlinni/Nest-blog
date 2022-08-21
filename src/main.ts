import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/http-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform.interceptor';
import { AllExceptionsFilter } from './core/filter/any-exception.filter';
import helmet from 'helmet';
// import csurf from 'csurf';
// import cookieParser from 'cookie-parser';
import express from 'express';
import { logger } from './middleware/logger.middleware';
import { Logger } from '@nestjs/common';
import { WsAdapter } from './ws/ws.adapt';
const PORT = process.env.PORT || 8000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app)); 

  // 路径前缀：如：http://www.dmyxs.com/api/v1/user
  // app.setGlobalPrefix('api/v1');

  //cors：跨域资源共享，方式一：允许跨站访问
  app.enableCors();
  // 方式二：const app = await NestFactory.create(AppModule, { cors: true });

  //防止跨站脚本攻击
  app.use(helmet());

  //CSRF保护：跨站点请求伪造
  // app.use(cookieParser());
  // app.use(csurf({ cookie: true }));
  // app.use((err, req, res, next) => {
  //   console.log(req.csrfToken())
  //   if (err.code !== 'EBADCSRFTOKEN') return next(err);
  //   // handle CSRF token errors here
  //   res.status(403);
  //   res.json({
  //     code: 403,
  //     msg: 'invalid csrf token',
  //   });
  // });
  app.use(express.json()); // For parsing application/json
  app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
  app.use(logger);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
   app.enableCors({
    // 允许的请求源
    origin: '*'
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(PORT, () => {
    Logger.log(`服务已经启动,接口请访问:http://wwww.localhost:${PORT}`);
  });
}
bootstrap();
