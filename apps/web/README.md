# Web

## envvars

Note that envvars need to be on build time, not on run (because they need to be _defined_ in the source code)

| env var   | Default                     | Description                                       |
| --------- | --------------------------- | ------------------------------------------------- |
| `API_URL` | `http://localhost:3000/api` | Where the API is running (without trailing slash) |

## parameters

To be provided when calling the command, i.e.

```
npm run web:serve:development --port=3000
```

| parameter | Default | Description                          |
| --------- | ------- | ------------------------------------ |
| `--port`  | `4200`  | Where the Next.js server will run on |
