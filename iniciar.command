#!/bin/zsh
cd "${0:A:h}"
export PORT=3100
(sleep 1; open http://localhost:3100) &
node server.mjs
