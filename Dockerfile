FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN pip install yt-dlp

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

ENV TEMP_DIR=/tmp
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]
