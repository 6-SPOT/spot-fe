# 1단계: 빌드 단계
FROM node:22.13.1 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build  # 👉 꼭 프로덕션 빌드!

# 2단계: 실행 환경 (최소 사이즈로)
FROM node:22.13.1 AS runner
WORKDIR /app

ENV NODE_ENV=production

# 빌드 산출물만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
