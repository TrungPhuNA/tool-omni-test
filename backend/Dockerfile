# Sử dụng node image chính thức
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install --production

# Sao chép toàn bộ mã nguồn
COPY . .

# Mở cổng 5005 (theo config trong .env)
EXPOSE 5005

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]
