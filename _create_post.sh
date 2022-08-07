#!/bin/bash

filename=_posts/$(date "+%Y-%m-%d")-$(
    echo $1 \
        | sed -r 's/ /-/g' \
        | sed -r 's/[^-_[:alnum:]]//g' \
        | tr '[:upper:]' '[:lower:]' \
        | cut -c '1-50'
).md

{
    echo ---
    echo "layout: post"
    echo "title:  \"${1}\""
    echo "date:   $(date "+%Y-%m-%d %T%z")"
    echo "tags:"
    echo "math-enabled: false"
    echo "# excerpt: \"\""
    echo "---"
} > $filename

echo "Created '${filename}'"
