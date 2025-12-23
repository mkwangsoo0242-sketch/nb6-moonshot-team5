import express from 'express';
import cors from 'cors';
import { PORT } from './lib/constants';
import { defaultNotFoundHandler, errorHandler } from './handler/errorHandler';

//express app 생성
const app = express();

//CORS 설정
app.use(cors());

//JSON 파싱 미들웨어 설정
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use(defaultNotFoundHandler);
app.use(errorHandler);

//서버 시작
app.listen(PORT, () => {
  console.log(`team5 Server is running on port ${PORT}`);
});
