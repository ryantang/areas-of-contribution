#!/bin/bash

set -euo pipefail

cd $(dirname $0)

go build -o bin/md-generator ./md-generator/main.go
go build -o bin/webapp-config-generator ./webapp-config-generator/main.go

for skillArea in ../yaml/*.yaml; do
  bin/md-generator $skillArea > ../$(basename $skillArea .yaml).md
done

bin/webapp-config-generator -input ../yaml -output form-updater/config-skillAreas.js

echo "success"
