import express from 'express';
import dotenv from 'dotenv';
import restaurantRoute from './routes/restaurant.route';
import uploadRoute from './routes/upload.route';

import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/restaurants', restaurantRoute);
app.use('/api/uploads', uploadRoute);



// test upload file
// const formData = new FormData();
// formData.append("file", selectedFile);

// const response = await fetch("http://localhost:5000/api/uploads", {
//   method: "POST",
//   body: formData,
// });

// const data = await response.json();
// console.log(data.fileUrl); // URL ảnh


export default app;