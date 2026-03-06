FROM mcr.microsoft.com/mssql/server:2022-latest

USER root
WORKDIR /usr/src/app

COPY createDb.sql .
COPY entrypoint.sh .
COPY setup.sh .

RUN chmod +x entrypoint.sh setup.sh

USER mssql
CMD ["./entrypoint.sh"]
