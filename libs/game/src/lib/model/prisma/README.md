# Prisma

Ref: https://www.prisma.io/docs/getting-started/quickstart

## Visualize data

```
npx prisma studio --schema=./libs/game/src/lib/model/prisma/schema.prisma
```

## Re(generate) the client

```
prisma generate --schema=./libs/game/src/lib/model/prisma/schema.prisma
```

## Create Database

```
npx prisma migrate dev --name init --schema=./libs/game/src/lib/model/prisma/schema.prisma
```

## Update (migrate) schema

i.e. when adding tables, etc.

```
npx prisma migrate dev --name hanagames --schema=./libs/game/src/lib/model/prisma/schema.prisma
```
