#!/bin/bash

filename=_posts/$(date --rfc-3339=date)-$(
    echo $1 \
        | sed -r 's/\s/-/g' \
        | sed -r 's/[^-_[:alnum:]]//g' \
        | tr '[:upper:]' '[:lower:]' \
        | cut -c '1-50'
).md

{
    echo ---
    echo "layout: post"
    echo "title:  \"${1}\""
    echo "date:   $(date --rfc-3339=seconds)"
    echo "tags:"
    echo "math-enabled: false"
    echo "# description: \"\""
    echo "---"
} > $filename

echo "Created '${filename}'"
