#https://github.com/artoolkitx/jsartoolkit5
#https://github.com/AR-js-org/jsartoolkit5
FROM trzeci/emscripten-slim:latest as build
#grep -r -e "dl.bintray.com" /
RUN sed -i s#2b581c60ae401a79bbbe748ff2deeda5acd50bfd2ea22e5926e36d34b9ebcffb6580b0ff48e972c1441583e30e21e1ea821ca0423f9c67ce08a31dffabdbe6b7#b2affe9a1688bd49fc033f4682c4a242d4ee612f1affaef532f5adcb4602efc4433c4a52a4b3d69e7440ff1f6413b1b041b419bc90efd6d697999961a9a6afb7#g /emsdk_portable/emscripten/tag-1.39.4/tools/ports/libjpeg.py
RUN sed -i s#https://dl.bintray.com/homebrew/mirror/jpeg-9c.tar.gz#https://storage.googleapis.com/webassembly/emscripten-ports/jpegsrc.v9c.tar.gz#g /emsdk_portable/emscripten/tag-1.39.4/tools/ports/libjpeg.py
RUN cat /emsdk_portable/emscripten/tag-1.39.4/tools/ports/libjpeg.py

RUN apt update && apt install -y git
RUN git clone --depth=1 -b master https://github.com/artoolkitx/jsartoolkit5.git /src
RUN cd emscripten && git submodule update --init
RUN npm install
RUN npm run build-local

FROM nginx:1.21.0

COPY --from=build build /usr/share/nginx/html
COPY --from=build doc /usr/share/nginx/html
COPY --from=build examples /usr/share/nginx/html
COPY --from=build js /usr/share/nginx/html
COPY --from=build default.conf /etc/nginx/conf.d
COPY --from=build server.crt /etc/nginx
COPY --from=build server.key /etc/nginx