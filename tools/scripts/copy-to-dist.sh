#!/bin/bash

target=$1

# Erstelle den dist/$target Ordner, falls er nicht existiert
mkdir -p "dist/$target"

# Finde alle $target Ordner innerhalb des packages Ordners
find packages -type d -name "$target" | while read target_path; do
    # Extrahiere den relativen Pfad zwischen packages und $target
    # Entferne 'packages/' vom Anfang und '/$target' vom Ende
    relative_path=$(echo $target_path | sed 's|^packages/||' | sed "s|/$target$||")

    # Erstelle den Zielordner
    target_dir="dist/$target/$relative_path"
    mkdir -p "$target_dir"

    # Kopiere den Inhalt des $target Ordners
    cp -r "$target_path"/* "$target_dir"

    echo "Copied $target_path to $target_dir"
done
