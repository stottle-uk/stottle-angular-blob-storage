docker build -t stottle/angular-blob-storage  .

docker tag stottle/angular-blob-storage stottlecontainerregistry.azurecr.io/angular-blob-storage

docker run -p 4200:80 --rm stottlecontainerregistry.azurecr.io/angular-blob-storage

# docker push stottlecontainerregistry.azurecr.io/angular-blob-storage