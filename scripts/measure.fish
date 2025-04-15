#!/usr/bin/env fish

function cleanup
    fd --extension "min.js" | xargs -I % rm ./%
    fd --extension "min.js.br" | xargs -I % rm ./%
end

# Process arguments
set keep_output 0
for arg in $argv
    switch $arg
        case "--keep-output"
            set keep_output 1
    end
end

mkdir -p ./measure
cd dist
cleanup
set files (fd --extension "js")

for file in $files;
  cp "./$file" ../measure
  set minified (echo "$file" | sd '\.js' '.min.js')
  terser "./$file" -o "./$minified" --compress --mangle
end;
brotli -kq 11 ./**/*.min.js
cp ./**/*.min.js ./**/*.min.js.br ../measure

# Generate markdown table header
echo "|       file        | size (B) | terser[^terser] (B) | terser and brotli[^brotli] (B) |" >> ../size-report.md
echo "| ----------------- | -------- | ------------------- | ------------------------------ |" >> ../size-report.md

# Initialize totals
set total_orig 0
set total_min 0
set total_br 0

# Process each original file and find its corresponding minified and brotli versions
for orig_file in $files
    set base_file (basename -- "$orig_file")

    set file_size (wc -c < "../measure/$base_file")
    set min_file (echo "$base_file" | sd '\.js' '.min.js')
    set br_file "$min_file.br"

    set min_size (wc -c < "../measure/$min_file")
    set br_size (wc -c < "../measure/$br_file")

    # Update totals
    set total_orig (math $total_orig + $file_size)
    set total_min (math $total_min + $min_size)
    set total_br (math $total_br + $br_size)

    # Output table row with right-aligned numbers
    printf "| %-17s | %8d | %19d | %30d |\n" $orig_file $file_size $min_size $br_size >> ../size-report.md
end

# Add total row
printf "| %-17s | %8d | %19d | %30d |\n" "**total[^total]**" $total_orig $total_min $total_br >> ../size-report.md

# Display the report
cat ../size-report.md

# Clean up
cleanup
if test $keep_output -eq 0
    rm -rf ../measure
end
rm ../size-report.md
