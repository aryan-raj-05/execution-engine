FROM node:22-alpine

WORKDIR /app

# ARG DATABASE_URL
# ENV DATABASE_URL=$DATABASE_URL

# need this for npx prisma generate
# since that needs a string for database url
ENV DATABASE_URL="dummy"

COPY package*.json ./

RUN npm install

COPY . .

RUN apk add --no-cache docker-cli
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

# CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:codex"]
CMD ["sh", "-c", "npm run start:codex"]
