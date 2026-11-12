FROM node:22-slim
ENV HUSKY=0
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci

COPY apps/api apps/api
WORKDIR /app/apps/api

EXPOSE 3000
CMD ["npm", "run", "dev"]