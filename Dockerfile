FROM --platform=linux/amd64 node:18
ADD . /appdir
WORKDIR /appdir
CMD ["npm", "start"]
EXPOSE 8000