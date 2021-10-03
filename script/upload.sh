#!/bin/bash
usage="Usage: $(basename "$0") path -- Uploads to www.jezzamon.com/somepath"

if [ "$#" -ne 1 ]; then
    echo "$usage"
    exit 1
fi

path=$1

# TODO: Update HTML, etc so the path gets updated

gsutil -m rsync -r build/client gs://www.jezzamon.com/$path/
gsutil -m acl ch -r -u AllUsers:R gs://www.jezzamon.com/$path