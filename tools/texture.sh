#!/usr/bin/env bash
. ./tp2
bpath=/Users/x/Documents/xxxx/xxxxx/here
out="$bpath/src/statics"
assets="$bpath/src/components/sys/assets.json"
load_asset="$bpath/src/components/sys/load_asset.js"
rm $out/*.*
TexturePacker --format pixijs4 --sheet "$out/col1.png" --data "$out/col1.json" "$bpath/msource/collection1/"
TexturePacker --format pixijs4 --sheet "$out/col2.png" --data "$out/col2.json" "$bpath/msource/collection2/"
TexturePacker --format pixijs4 --sheet "$out/girls.png" --data "$out/girls.json" "$bpath/msource/girls/"
TexturePacker --format pixijs4 --sheet "$out/mapitems.png" --data "$out/mapitems.json" "$bpath/msource/mapitems/"

echo "python3 tptd.py $out $assets $load_asset"
python3 tptd.py $out $assets $load_asset
