#for run postgres
docker run --name authdb -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=authdb -p 5432:5432 -d postgres:15
