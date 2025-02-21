# Use a lightweight Node.js runtime for production
FROM node:22.13.1 AS runner
WORKDIR /app

# Copy only the necessary build files from GitHub Actions
COPY .next .next
COPY public public
COPY package.json .
COPY node_modules node_modules

# Expose the port Next.js runs on
EXPOSE 3000

# Set environment variables
# ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "dev"]

