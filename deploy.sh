#!/usr/bin/env sh

# abort on errors
set -e

# build
yarn run build

# navigate into the build output directory
cd public

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME
git init
git add -A
git commit -m 'deploy'
git remote add origin https://github.com/thefeeling/thefeeling.github.io.git
git push -f origin master

cd -