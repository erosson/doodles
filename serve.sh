#!/bin/sh -eux
rm -f arts/index.html
for f in arts/*.html; do
  bf=`basename $f`
  echo "<li><a href=\"./$bf\">$bf</a></li>" >> arts/index.html
done
python -m SimpleHTTPServer 8080
