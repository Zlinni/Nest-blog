import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
// import { Socket } from 'dgram';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import * as readline from 'readline';
import { glob } from 'glob';
import { count } from 'console';
import * as chokidar from 'chokidar';
import dayjs from 'dayjs';
interface colorRule {
  time: string;
  msgInfo: string;
  '>': string;
  '<': string;
  wordKey: string;
  wordValue: string;
}
interface LogStack {
  access: string;
  'app-out': string;
  error: string;
}
interface Log {
  fileName: string;
  logs: (LogInfo[] | LogInfo)[];
}
interface LogInfo {
  id: string;
  color: string;
  value: string;
}
// 注意ws端口号不能和http端口号一样，否则会冲突
@WebSocketGateway(3002, {
  cors: {
    origin: '*',
  },
})
export class WsStartGateway {
  strArr: Log[];
  colorRule: colorRule;
  watcher: any;
  logStack: LogStack;
  changeLine: boolean;
  myRadis: Map<string, Log[]>;
  constructor() {
    this.strArr = [];
    this.colorRule = {
      time: '#39d010',
      msgInfo: '#fdbc40',
      '>': '#35cd4b',
      '<': '#35cd4b',
      wordKey: '#35cd4b',
      wordValue: '#fff',
    };
    this.watcher = null;
    this.logStack = {
      access: '',
      'app-out': '',
      error: '',
    };
    this.changeLine = false;
    this.myRadis = new Map();
  }
  @SubscribeMessage('hello2')
  hello2(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<unknown> {
    console.log('收到消息 client:');
    client.send(JSON.stringify({ event: 'tmp', data: '这里是个临时信息' }));
    return { event: 'hello2', data: data };
  }
  @SubscribeMessage('sendLog')
  async sendLog(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ): Promise<WsResponse<unknown>> {
    console.log('收到消息 client:');
    // ws动态传输最新日志
    let files: Array<string> = [];
    if (data) {
      // console.log('data', data);
      // console.log('this.logStack[data]', this.logStack[data]);
      // 读取所有的日志
      files = glob.sync(`logs/${data}/*.log`);
      const lastestFile = files.at(-1);

      // 如果已经存在了则返回上次保存的日志，不再读取
      console.log('lastestFile', lastestFile);
      if (this.myRadis.has(lastestFile)) {
        client.send(
          JSON.stringify({
            event: 'sendLog',
            data: this.myRadis.get(lastestFile),
          }),
        );
        return;
      }
      // 监控最新的日志
      this.startWatch(data, client);
    } else {
      return { event: 'sendLog', data: '' };
    }
    this.saveData(files, client);
    // return { event: 'sendLog', data: this.strArr };
  }
  // 保存日志数据
  async saveData(files: string[], client: WebSocket) {
    this.strArr = [];
    // 先留着 后面方便拓展日志时期
    // for (let i = 0; i < files.length; i++) {
    this.strArr.push({
      // fileName: files[i],
      fileName: files.at(-1),
      // logs: await this.readLineAsync(files[i]),
      logs: await this.readLineAsync(files.at(-1)),
    });
    console.log('this.strArr', this.strArr);
    client.send(JSON.stringify({ event: 'sendLog', data: this.strArr }));
  }
  startWatch(path: string, client: WebSocket) {
    // 监控最新的日志，减少不必要的损耗
    const date = dayjs(new Date()).format('YYYYMMDD');
    if (this.watcher) {
      // 已经监视过不会再开启监视
      if (!this.logStack[path]) {
        this.watcher.add(`../../logs/${path}/${path}.${date}.log`);
      }
    } else {
      this.watcher = chokidar.watch(`logs/${path}/${path}.${date}.log`);
      this.watcher.on('all', (event: any, filepath: string) => {
        //监听除了ready, raw, and error之外所有的事件类型
        console.log(event, filepath);
      });
      this.watcher.on('ready', (filepath: string) => {
        console.log('ready', filepath);
      });
      this.watcher.on('add', (filepath: string) => {
        console.log('增加监听', filepath);
        console.log(this.watcher.getWatched());
        // 增加标识符
        this.logStack[filepath] = 'fileWatching';
      });
      this.watcher.on('change', (filepath: string) => {
        console.log('监听+文件更新:' + filepath);
        // 这里的filepath 和 实际的filepath不一样 一个用的是\\ 一个用的是/
        this.logStack[filepath] = 'fileChange';
        // console.log()
        this.saveData([filepath], client);
      });
      this.watcher.on('unlink', (filepath: string) => {
        this.watcher.unwatch(filepath);
        if (fs.existsSync(filepath)) {
          this.watcher.add(filepath);
          this.saveData([filepath], client);
        }
      });
    }
  }
  // 取消监视
  endWatch(path: string) {
    console.log('watcher', this.watcher);
    if (this.watcher) {
      console.log('移除监听-', path);
      this.watcher.unwatch(path);
    }
  }
  // 读取本地日志
  async readLineAsync(file: string) {
    try {
      let rl = readline.createInterface({
        input: fs.createReadStream(file),
      });
      let arr = [];
      // 保存id
      let count = 0;
      let startPos = 0;
      // 正则做不出来。。。
      if (file.includes('\\')) {
        file = file.split('\\').at(-1);
      } else {
        file = file.split('/').at(-1);
      }
      if (this.myRadis.has(file)) {
        // 如果缓存里面有数据 则此次的读取从该缓存行(数组长度)开始
        const tmpRadis = this.myRadis.get(file);
        startPos = tmpRadis.length;
        arr = tmpRadis;
        console.log('startPos', startPos);
      }
      // 保证当前行读完才读取下一行
      for await (const line of rl) {
        // 不做任何操作直到到缓存最后的位置
        if (count < startPos) {
          count++;
          continue;
        }
        const fLine = line.trim();
        let tmp = null;
        if (this.changeLine) {
          tmp = {
            value: fLine,
            color: this.colorRule.wordValue,
            id: count,
          };
          this.changeLine = false;
        } else {
          if (fLine.startsWith('[')) {
            tmp = this.formatterMsgTitle(fLine, count);
          } else if (fLine.startsWith('<')) {
            tmp = this.formatterMsgDivide1(fLine, count);
          } else if (fLine.startsWith('>')) {
            tmp = this.formatterMsgDivide2(fLine, count);
          } else {
            if (fLine.length === 0) {
              tmp = { value: '', color: '', id: count };
            } else {
              tmp = this.formatterWord(fLine, count);
            }
          }
        }
        count++;
        arr.push(tmp);
      }
      //考虑使用radis缓存 或者 本地缓存 (目前问题是没学过radis)
      // 存在map里面
      this.myRadis.set(file, arr);
      return arr;
    } catch (error) {}
  }
  formatterMsgTitle(word: string, count: number) {
    word = word.trim();
    let res = [];
    // 计数器 第一行 存在两个【】
    let counter = 0;
    while (word.startsWith('[')) {
      let idx = word.indexOf(']');
      res.push({
        id: `${count}-${counter}`,
        value: word.slice(0, idx + 1),
        color: counter === 0 ? this.colorRule.time : this.colorRule.msgInfo,
      });
      word = this.advanceBy(word, idx + 1);
      word = word.trim();
      counter++;
    }
    if (word) {
      res.push({
        id: `${count}-${counter}`,
        value: word,
        color: this.colorRule.wordValue,
      });
    }
    return res;
  }
  formatterMsgDivide1(word: string, count: number) {
    return {
      id: count,
      value: word,
      color: this.colorRule['<'],
    };
  }
  formatterMsgDivide2(word: string, count: number) {
    return {
      id: count,
      value: word,
      color: this.colorRule['<'],
    };
  }
  formatterWord(word: string, count: number) {
    let keys = [
      'Request original url',
      'Method',
      'IP',
      'Status code',
      'Response',
      'Parmas',
      'Query',
      'Body',
      'User',
      'Response data',
    ];
    let res = [];
    for (const key of keys) {
      // 如果此时key是Response，且开头为Response data 那么就跳过该项
      if (key === 'Response' && word.startsWith('Response data')) {
        continue;
      } else if (word.startsWith(key)) {
        res.push({
          id: count,
          value: key + ':',
          color: this.colorRule.wordKey,
        });
        // 因为只有Response data有换行
        if (key !== 'Response data') {
          let idx = word.indexOf(':');
          res.push({
            id: count,
            value: this.advanceBy(word, idx + 1).trim(),
            color: this.colorRule.wordValue,
          });
        } else {
          this.changeLine = true;
        }
      }
    }
    // console.log(res,'---')
    // 说明不是规则内的情况 如Response data
    // if (res.length === 0) {
    //   res.push({
    //     value: word,
    //     color: this.colorRule.wordValue,
    //   });
    // }
    return res;
  }
  advanceBy(context, numberOfCharacters) {
    return context.slice(numberOfCharacters);
  }
}
