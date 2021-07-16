FROM node:14.15.5 as build

WORKDIR app

COPY package.json .

RUN yarn

COPY . .

RUN yarn build


FROM node:14.15.5

ENV NODE_ENV=production

WORKDIR app

COPY package.json .
RUN yarn --production

COPY --from=build /app/dist dist

EXPOSE 4000

CMD ["npx", "dotenv",  "-e", "./dotenv/.env", " -- ", "yarn", "prod"]
