docker build -t stottleuk/blob-storage-angular .

docker tag stottleuk/blob-storage-angular stottlecontainerregistry.azurecr.io/blob-storage-angular

docker run -p 4201:80 --rm stottlecontainerregistry.azurecr.io/blob-storage-angular

# docker push stottlecontainerregistry.azurecr.io/blob-storage-angular