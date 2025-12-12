## Licensed to the Apache Software Foundation (ASF) under one or more
## contributor license agreements.  See the NOTICE file distributed with
## this work for additional information regarding copyright ownership.
## The ASF licenses this file to You under the Apache License, Version 2.0
## (the "License"); you may not use this file except in compliance with
## the License.  You may obtain a copy of the License at
##
##     http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an "AS IS" BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.

## Apache Jena Fuseki server Dockerfile.

ARG JAVA_VERSION=21

FROM eclipse-temurin:${JAVA_VERSION}-jdk

ARG JENA_VERSION=""
ENV FUSEKI_VERSION=${JENA_VERSION}

RUN [ "${JENA_VERSION}" != "" ] || { echo -e '\n**** Set JENA_VERSION ****\n' ; exit 1 ; }

# Install wget
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Create Fuseki directory
RUN mkdir -p /fuseki

# Download and extract Fuseki
WORKDIR /tmp
RUN wget -q --show-progress https://archive.apache.org/dist/jena/binaries/apache-jena-fuseki-${JENA_VERSION}.tar.gz && \
    tar -xzf apache-jena-fuseki-${JENA_VERSION}.tar.gz && \
    cp -r apache-jena-fuseki-${JENA_VERSION}/* /fuseki/ && \
    rm -rf apache-jena-fuseki-${JENA_VERSION}* && \
    chmod +x /fuseki/fuseki-server

# Create non-root user
RUN useradd -u 1001 -m -s /bin/bash fuseki

# Copy example data for initialization
# Note: COPY paths are relative to build context (fuseki/)
COPY example/example_project_scrum_aligned.ttl /tmp/example_data.ttl

# Create directories and pre-load example data into TDB2
# Use tdbloader directly from Fuseki JAR
RUN mkdir -p /fuseki/databases/pm && \
    mkdir -p /fuseki/logs && \
    java -cp /fuseki/fuseki-server.jar tdb2.tdbloader --loc=/fuseki/databases/pm /tmp/example_data.ttl && \
    rm /tmp/example_data.ttl && \
    chown -R fuseki:fuseki /fuseki

# Switch to non-root user
USER fuseki

WORKDIR /fuseki

# Set environment variables
ENV FUSEKI_HOME=/fuseki \
    FUSEKI_BASE=/fuseki

EXPOSE 3030

CMD ["/fuseki/fuseki-server", "--config=/fuseki/config.ttl"]
