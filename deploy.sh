#!/bin/sh -eux
# https://gist.github.com/cobyism/4730490
rm -rf dist/
mkdir dist

set +e
cp -rp * dist
set -e
rm -rf dist/dist

git subtree push --prefix dist/ origin gh-pages
