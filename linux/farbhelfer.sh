#!/bin/sh
exec /usr/bin/electron43 --ozone-platform-hint=auto --enable-features=WaylandWindowDecorations /usr/lib/farbhelfer "$@"
