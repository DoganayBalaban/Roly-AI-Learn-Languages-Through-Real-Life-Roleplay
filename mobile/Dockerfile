FROM node:20-alpine
WORKDIR /app

# Expo CLI ve bağımlılıklar
RUN npm install -g expo-cli
COPY package*.json ./
RUN npm install

COPY . .

# Expo web için 19006, metro bundler için 19000-19002 portları
EXPOSE 19000 19001 19002 8081
CMD ["npx", "expo", "start", "--web"]