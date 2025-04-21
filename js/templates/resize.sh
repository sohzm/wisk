#!/bin/bash

# needs imagemagick
#
# Navigate to the templates directory
cd templates

# Loop through all directories in templates
for template_dir in */; do
    # Remove trailing slash
    template_dir=${template_dir%/}
    
    echo "Processing directory: $template_dir"
    
    # Create preview directory if it doesn't exist
    mkdir -p "$template_dir/preview"
    
    # Resize desktop.png to 250px width (only if it exists)
    if [ -f "$template_dir/desktop.png" ]; then
        echo "  Resizing desktop.png to 250px width"
        convert "$template_dir/desktop.png" -resize 450 "$template_dir/preview/desktop.png"
    fi
    
    # Resize phone.png to 100px width (only if it exists)
    if [ -f "$template_dir/phone.png" ]; then
        echo "  Resizing phone.png to 100px width"
        convert "$template_dir/phone.png" -resize 100 "$template_dir/preview/phone.png"
    fi
    
    echo "  Done with $template_dir"
done

echo "All templates processed successfully!"
