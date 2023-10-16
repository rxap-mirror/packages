#!/bin/bash

# This script is used to ask the user if the local changes should be pushed to the remote repository.

read -p "Do you want to push the changes to the remote repository? (y/n) " -n 1 -r

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo
    echo "Pushing changes to remote repository..."
    git push --tags
    echo "Done."
fi
