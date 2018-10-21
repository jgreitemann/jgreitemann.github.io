#!/bin/bash

old_filename=$1

if [ ! -e "$old_filename" ]; then
    echo "$0: post '$1' does not exist." >&2
    exit 1
fi

titlename=$(basename $1 | sed -r 's/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//g')

filename=$(dirname $1)/$(date --rfc-3339=date)-$titlename

sed -r "s/^date:.*\$/date:   $(date --rfc-3339=seconds)/g" $old_filename > $filename

echo "Updated '${filename}':"
head $filename
rm -i $old_filename
