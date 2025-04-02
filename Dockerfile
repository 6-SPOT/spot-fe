# 1단계: 빌드용 이미지
FROM node:22.13.1 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 프로덕션 빌드
RUN npm run build

# 2단계: 실행용 이미지
FROM node:22.13.1 AS runner
WORKDIR /app

ENV NODE_ENV=production

# 빌드 산출물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

# 프로덕션 의존성만 설치
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
