# Usamos como base la imagen oficial de Ubuntu 22.04
FROM ubuntu:22.04

# Descripción de la imagen para documentar su propósito
LABEL Description="Esta imagen proporciona un entorno de desarrollo Android base para React Native, y puede usarse para correr pruebas."

# Configuramos para que las instalaciones no pidan interacción (evita prompts)
ENV DEBIAN_FRONTEND=noninteractive

# Argumentos con versiones por defecto que pueden modificarse al construir la imagen
ARG SDK_VERSION=commandlinetools-linux-11076708_latest.zip
ARG ANDROID_BUILD_VERSION=36
ARG ANDROID_TOOLS_VERSION=36.0.0
ARG NDK_VERSION=27.1.12297006
ARG NODE_VERSION=22.14
ARG WATCHMAN_VERSION=4.9.0
ARG CMAKE_VERSION=3.30.5

# Variables de entorno para Android SDK y NDK
ENV ADB_INSTALL_TIMEOUT=10
ENV ANDROID_HOME=/opt/android
ENV ANDROID_SDK_ROOT=${ANDROID_HOME}
ENV ANDROID_NDK_HOME=${ANDROID_HOME}/ndk/$NDK_VERSION

# Variable de entorno para Java 17 OpenJDK
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Ruta donde está instalado CMake
ENV CMAKE_BIN_PATH=${ANDROID_HOME}/cmake/$CMAKE_VERSION/bin

# Añadimos al PATH las herramientas de Android y CMake para poder ejecutarlas fácilmente
ENV PATH=${CMAKE_BIN_PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/emulator:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${PATH}

# Instalamos dependencias del sistema necesarias para compilación, desarrollo y herramientas
RUN apt update -qq && apt install -qq -y --no-install-recommends \
    apt-transport-https \
    curl \
    file \
    gcc \
    git \
    g++ \
    gnupg2 \
    libc++1-11 \
    libgl1 \
    libtcmalloc-minimal4 \
    make \
    openjdk-17-jdk-headless \
    openssh-client \
    patch \
    python3 \
    python3-distutils \
    rsync \
    ruby \
    ruby-dev \
    tzdata \
    unzip \
    sudo \
    ninja-build \
    zip \
    ccache \
    libicu-dev \
    jq \
    shellcheck && \
    gem install bundler && \
    rm -rf /var/lib/apt/lists/*

# Instalamos Node.js usando el gestor 'n'
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n && \
    bash n $NODE_VERSION && \
    rm n && \
    npm install -g n && \
    npm install -g yarn

# Descargamos e instalamos las herramientas de línea de comandos de Android
RUN curl -sS https://dl.google.com/android/repository/${SDK_VERSION} -o /tmp/sdk.zip && \
    mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    unzip -q -d ${ANDROID_HOME}/cmdline-tools /tmp/sdk.zip && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/sdk.zip && \
    yes | sdkmanager --licenses && \
    yes | sdkmanager "platform-tools" "platforms;android-$ANDROID_BUILD_VERSION" "build-tools;$ANDROID_TOOLS_VERSION" "cmake;$CMAKE_VERSION" "ndk;$NDK_VERSION" && \
    rm -rf ${ANDROID_HOME}/.android && \
    chmod -R 777 /opt/android

# Configuramos git para que acepte cualquier directorio como seguro (importante en CI/CD)
RUN git config --global --add safe.directory '*'