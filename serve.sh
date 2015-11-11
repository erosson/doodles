#!/bin/sh -eux
rm -f index.html
for f in *.html; do
  bf=`basename $f`
  echo "<li><a href=\"./$bf\">$bf</a></li>" >> index.html
done
python -m SimpleHTTPServer 8080
