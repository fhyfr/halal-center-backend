# Halal Center API Service

REST API builth with NodeJS for Halal Center Application

## How to Run this Service

1.  Make sure you have NodeJS and NPM installed on you computer
2.  You need to install PostgreSQL as primary database and Redis as database for caching
3.  Install all project dependencies with npm, run:

```
$ npm install
```

4.  Copy and paste `.env.example` and rename as `.env` file, then fill out all the necessary environtment based on your computer configuration
5.  Get your `credentials.json` from GCP (Google Cloud Platform) and save in the root directory
6.  Run this project by execute this command on your terminal:

```
$ npm run dev
```

> You can simply run `make build_dev` and `make run_dev` commands if you are using Docker

## Tech Stack

- Programming Languages and Frameworks : NodeJS with Express framework
- Database : PostgreSQL and Redis
- Containerization: Docker

## References

- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [NodeJS](https://nodejs.org/en/) & [NPM](https://www.npmjs.com/)
- [ExpressJS](https://expressjs.com/)
- [Docker](https://docs.docker.com/engine/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node Version Manager](https://github.com/nvm-sh/nvm)
- [ESlint for Linter](https://eslint.org/)

## License

MIT - [@fhyfr](https://github.com/fhyfr/)
