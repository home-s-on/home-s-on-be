FROM node:20-alpine
RUN mkdir -p /app
WORKDIR /app
ADD . /app
RUN npm install
ENV NODE_ENV=production
EXPOSE 5001
CMD ["npm","start"]