#!/bin/sh -eux
# https://gist.github.com/cobyism/4730490
rm -rf dist/
mkdir dist

echo '# doodles' > README.md
echo "quick  little js experiments that don't deserve their own repo or build scripts" >> README.md
echo "" >> README.md
for f in `ls -t *.html`; do
  bf=`basename $f`
  if [ "$bf" != "index.html" ]; then
    echo "* [$bf](https://erosson.github.io/doodles/$bf)" >> README.md
  fi
done

set +e
cp -rp * dist
set -e
rm -rf dist/dist

git subtree push --prefix dist/ origin gh-pages
