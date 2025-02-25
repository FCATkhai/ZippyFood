project-name/
├── backend/             # Backend (Node.js + Express + MongoDB)
│   ├── config/          # Cấu hình (database, environment,...)
│   ├── controllers/     # Xử lý logic API
│   ├── middleware/      # Middleware cho Express.js
│   ├── models/          # Schema dữ liệu (MongoDB/Mongoose)
│   ├── routes/          # Endpoint API
│   ├── utils/           # Hàm tiện ích
│   ├── app.js           # File khởi tạo Express.js
│   └── server.js        # Entry point của server
│
├── frontend/            # Frontend (Nuxt.js SPA)
│   ├── assets/          # Hình ảnh, CSS/SCSS
│   ├── components/      # Các component tái sử dụng
│   ├── layouts/         # Các layout chính (Header, Footer,...)
│   ├── middleware/      # Middleware của Nuxt.js
│   ├── pages/           # Tự động tạo route từ các file ở đây
│   ├── plugins/         # Plugin bên thứ 3 (axios, vue-chart,...)
│   ├── static/          # Tài nguyên tĩnh như favicon, robots.txt
│   ├── store/           # Vuex Store (quản lý trạng thái)
│   ├── nuxt.config.js   # File cấu hình Nuxt.js
│   └── package.json     # Thông tin dependencies frontend
│
├── .env                 # Cấu hình môi trường dùng chung
├── .gitignore           # Danh sách file không commit vào git
├── package.json         # Thông tin dependencies dùng chung
└── README.md            # Tài liệu hướng dẫn
