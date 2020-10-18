#!/bin/bash

convert -resize 72x72 icon.png icon-72x72.png
convert -resize 96x96 icon.png icon-96x96.png
convert -resize 128x128 icon.png icon-128x128.png
convert -resize 144x144 icon.png icon-144x144.png
convert -resize 152x152 icon.png icon-152x152.png
convert -resize 192x192 icon.png icon-192x192.png
convert -resize 384x384 icon.png icon-384x384.png
convert -resize 512x512 icon.png icon-512x512.png

optipng -o 7 icon-*
