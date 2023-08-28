# Stockaid Backend

创建docker容器, 并且运行docker容器,并设置文件关联方法
端口: 主机端口:docker端口
分别执行下面的两个命令.
```
docker build .
docker run -p 8000:8000 --name APP_NAME -v MY_PATH:/app  <image-id>
```

# API Example

API文档例子
```
POST /photo

Description:
Saves a photo

Photo:
- name: string, required, the name of the photo
- description: string, required, the description of the photo
- filename: string, required, the filename of the photo
- views: number, required, the view count of the photo
- isPublished: boolean, required, whether the photo is published

Response:
- A Photo object if the operation was successful
- An error message if something went wrong

Status codes:
- 201: Created, the photo was successfully saved
- 400: Bad Request, the request was invalid or could not be processed
- 500: Internal Server Error, something went wrong on the server

```

## .env.example
```
PORT=Your Port

HOST=Your Database Host
DATABASE_PORT=Your Database Port
DB_USER=Your Database Username
PASSWORD=Your Database Password
DATABASE=Your Database Name

FINANCIAL_MODELING_KEY=API KEY
FINANCIAL_API_BASE_URL=Base Url

ISSUER=your-issuer-url
AUDIENCE=your-audience
SECRET=your-secret
TOKEN_SIGNING_ALG=HS256
```
## 请求的方法

DataModel
```ts
// 在前端定义的 Photo 接口
interface Photo {
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
}

// 创建一个 Photo 对象
const newPhoto: Photo = {
  name: "Me and Bears",
  description: "I am near polar bears",
  filename: "photo-with-bears.jpg",
  views: 1,
  isPublished: true
};

// 使用 axios 发送 POST 请求
axios.post('http://your-api-url/photo', newPhoto)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

```
## 响应:

返回一个表示保存成功的照片的 JSON 对象。
```json
{
  "id": 1,
  "name": "Me and Bears",
  "description": "I am near polar bears",
  "filename": "photo-with-bears.jpg",
  "views": 1,
  "isPublished": true
}
```

定义DataModel
```ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int')
  views: number;

  @Column()
  isPublished: boolean;
}
```

定义相关router
```ts
import express from 'express';
import { savePhoto, findPhoto } from '../controllers';

const router = express.Router();

router.post('/photo', async (req, res) => {
  try {
    const photo = await savePhoto(req.body);
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/photos', async (req, res) => {
  try {
    const photos = await findPhoto();
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
```

执行操作
```ts
import { Photo } from '../models';
import { AppDataSource } from '../configuration';

export async function savePhoto(photoData: Partial<Photo>): Promise<Photo> {
  const photo = new Photo();
  photo.name = photoData.name || 'Default Name';
  photo.description = photoData.description || 'Default Description';
  photo.filename = photoData.filename || 'default.jpg';
  photo.views = photoData.views || 0;
  photo.isPublished = photoData.isPublished || false;

  try {
    const savedPhoto = await AppDataSource.manager.save(photo);
    return savedPhoto;
  } catch (error) {
    throw new Error(`Error while saving photo: ${error.message}`);
  }
}

export async function findPhoto(): Promise<Photo[]> {
  try {
    const savedPhotos = await AppDataSource.manager.find(Photo);
    return savedPhotos;
  } catch (error) {
    throw new Error(`Error while fetching photos: ${error.message}`);
  }
}
```

最后在datasource中注册实体
```ts
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Photo } from '../models';
import * as fs from 'fs';

if (fs.existsSync(`.env.${process.env.NODE_ENV}`)) {
  config({ path: `.env.${process.env.NODE_ENV}` });
} else {
  console.log('Using default .env file');
  config();
}

const host: string = process.env.HOST as string;
const port: number = parseInt(process.env.DATABASE_PORT as string, 10);
const username: string = process.env.USERNAME as string;
const password: string = process.env.PASSWORD as string;
const database: string = process.env.DATABASE as string;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: host,
  port: port,
  username: username,
  password: password,
  database: database,
  entities: [Photo],
  synchronize: true,
  logging: false,
});
```