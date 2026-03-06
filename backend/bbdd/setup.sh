#!/bin/bash
# Wait for SQL Server to start up
echo "WAITING FOR SQL SERVER TO START..."
sleep 20s

echo "RUNNING createDb.sql SCRIPT..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -d master -i createDb.sql -C
echo "DATABASE SETUP FINISHED."
