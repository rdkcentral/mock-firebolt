FROM node:16

# Create directory for firebolt-related projects
WORKDIR /usr/src/firebolt



# ------------------------------------ CLI ------------------------------------

# Create directory for cli
WORKDIR /usr/src/firebolt/mock-firebolt/cli

# Copy over /cli directory
COPY ./cli .

RUN npm install



# ----------------------------------- Server -----------------------------------

# Create directory for server
WORKDIR /usr/src/firebolt/mock-firebolt/server

# Copy over /server directory
COPY ./server .

RUN npm install

# ----------------------------------- General ----------------------------------

EXPOSE 9998
EXPOSE 3333

ENV PATH=${PATH}:/usr/src/firebolt/mock-firebolt/cli

# Handy for debugging:
# ENTRYPOINT ["tail", "-f", "/dev/null"]

WORKDIR /usr/src/firebolt/mock-firebolt/server

ENTRYPOINT [ "npm",  "run", "start" ]
# By default, core/manage OpenRPC retrieved from HTTP is enabled.
CMD [ ]