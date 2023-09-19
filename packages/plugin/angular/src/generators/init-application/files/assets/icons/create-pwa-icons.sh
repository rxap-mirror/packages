#!/bin/bash

SIZES=("57x57" "60x60" "72x72" "76x76" "96x96" "114x114" "120x120" "128x128" "144x144" "152x152" "180x180" "192x192" "384x384" "512x512" "32x32" "96x96" "16x16")

for size in "${SIZES[@]}"
do
   convert -resize "${size}" icon.png "icon-${size}.png"
done

optipng -o 7 icon-*
optipng -o 7 icon.png
