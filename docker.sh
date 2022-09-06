#!/usr/bin/env sh

# sudo chown linus: -R /home/linus/Work/eco-rewards/ecorewards.co.uk/_site/assets/image/post/walking-and-cycling-routes/ && docker build . -t eco

docker run -it -p 4000:4000 -v /home/linus/Work/eco-rewards/ecorewards.co.uk:/site eco
