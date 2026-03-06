#!/bin/bash

# Start the script to create the DB and data
./setup.sh &

# Start SQL Server
/opt/mssql/bin/sqlservr
