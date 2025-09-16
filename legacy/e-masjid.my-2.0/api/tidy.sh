#!/bin/sh
# Recursively mod tidy all files in the current directory

cd cadangan-api
go mod tidy
cd ..

cd cadangan-public-api
go mod tidy
cd ..

cd khairat-api
go mod tidy
cd ..

cd kariah-api
go mod tidy
cd ..

cd tabung-api
go mod tidy
cd ..

cd tetapan-api
go mod tidy
cd ..

cd tetapan-public-api
go mod tidy
cd ..
