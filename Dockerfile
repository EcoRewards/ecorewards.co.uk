FROM alpine:latest

LABEL maintainer="Linus Norton <linusnorton@gmail.com>"

VOLUME /site

EXPOSE 4000

WORKDIR /site

RUN apk update && \
    apk --update add \
    gcc \
    g++ \
    make \
    curl \
    bison \
    ca-certificates \
    tzdata \
    ruby \
    ruby-rdoc \
    ruby-irb \
    ruby-bundler \
    ruby-nokogiri \
    ruby-dev \
    glib-dev \
    zlib-dev \
    libc-dev && \
    echo 'gem: --no-document' > /etc/gemrc && \
    gem install github-pages && \
    gem install jekyll-watch && \
    gem install jekyll-admin && \
    gem install webrick && \
    apk del gcc g++ binutils bison perl nodejs make curl && \
    rm -rf /var/cache/apk/*

CMD bundle install && bundle exec jekyll serve --watch --force_polling --host 0.0.0.0


