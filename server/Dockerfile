FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build TypeScript for production
RUN npm run build

EXPOSE 5000

# Production mode: run compiled JavaScript
CMD ["npm", "run", "start"]