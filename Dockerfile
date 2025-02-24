# Use a lightweight Node.js runtime for production
FROM node:22.13.1 AS runner
WORKDIR /app

# Copy only the necessary build files from GitHub Actions
COPY . .

# Install dependencies (if not included in the image)
RUN npm install

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]