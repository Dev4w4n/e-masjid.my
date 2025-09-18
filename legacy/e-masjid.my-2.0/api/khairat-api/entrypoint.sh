#!/bin/sh
set -e

# Execute scripts in /docker-entrypoint.d, if any
if [ -d "/docker-entrypoint.d" ]; then
    for script in /docker-entrypoint.d/*; do
        if [ -x "$script" ]; then
            echo "Running $script"
            "$script"
        else
            echo "Skipping $script, not executable"
        fi
    done
fi

# Pass control to CMD
exec "$@"
