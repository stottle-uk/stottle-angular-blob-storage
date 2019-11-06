docker build -t stottleuk/angular-blob-storage  .

docker tag stottleuk/angular-blob-storage stottlecontainerregistry.azurecr.io/angular-blob-storage

docker run -p 4201:80 --rm stottlecontainerregistry.azurecr.io/angular-blob-storage

# docker push stottlecontainerregistry.azurecr.io/angular-blob-storage