#!/usr/bin/env fish

function cleanup
    fd --extension "min.js" | xargs -I % rm ./%
    fd --extension "min.js.br" | xargs -I % rm ./%
end

mkdir -p ./measure
cd dist/es
cleanup
set files (fd --extension "js")

for file in $files;
  cp "./$file" ../../measure
  set minified (echo "$file" | sd '\.js' '.min.js')
  terser "./$file" -o "./$minified" --compress --mangle
end;
brotli -kq 11 ./*.min.js
cp *.min.js *.min.js.br ../../measure
cw -c ../../measure/*
cleanup
rm -rf ../../measure

