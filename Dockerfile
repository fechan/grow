FROM node:20-alpine
COPY . /usr/src/grow
WORKDIR /usr/src/grow
CMD ["node", "index"]