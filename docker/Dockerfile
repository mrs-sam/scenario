FROM ubuntu:17.10
MAINTAINER Xavier Blanc <blancxav@gmail.com>

# Git 
RUN apt-get update -y \
	&& apt-get install git -y 
	
# Install node
RUN apt-get update -y \
	&& apt-get install curl -y
RUN curl -o /usr/local/bin/n https://raw.githubusercontent.com/visionmedia/n/master/bin/n
RUN chmod +x /usr/local/bin/n
RUN n latest

# Installing the packages needed to run Headless Nightmare
RUN apt-get install -y \
  xvfb \
  x11-xkb-utils \
  xfonts-100dpi \
  xfonts-75dpi \
  xfonts-scalable \
  xfonts-cyrillic \
  x11-apps \
  clang \
  libdbus-1-dev \
  libgtk2.0-dev \
  libnotify-dev \
  libgnome-keyring-dev \
  libgconf2-dev \
  libasound2-dev \
  libcap-dev \
  libcups2-dev \
  libxtst-dev \
  libxss1 \
  libnss3-dev \
  gcc-multilib \
  g++-multilib

RUN adduser --quiet --disabled-password --shell /bin/bash --home /home/nodeweb --gecos "User" nodeweb

USER nodeweb
RUN mkdir /tmp/Node
WORKDIR /tmp/Node
ADD run.sh .

EXPOSE 8080

CMD ["bash","./run.sh"]